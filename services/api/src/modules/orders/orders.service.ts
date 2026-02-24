import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, TransactionType } from '@prisma/client';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationsService } from '../ws/notifications.service';

/**
 * Конфигурация переходов состояний (state machine)
 */
const STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['RESERVED', 'CANCELLED', 'HIDDEN'],
  RESERVED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['PAID', 'CANCELLED', 'DISPUTED'],
  PAID: ['CONFIRMED', 'DISPUTED'],
  CONFIRMED: ['COMPLETED'],
  COMPLETED: [], // Конечное состояние
  CANCELLED: [], // Конечное состояние
  DISPUTED: ['RESOLVED'],
  RESOLVED: ['COMPLETED', 'CANCELLED'],
  HIDDEN: ['ACTIVE', 'CANCELLED'],
};

export interface CreateOrderDto {
  telegramId: string;
  username?: string;
  type: 'BUY' | 'SELL';
  rate: number;
  minLimit: number;
  maxLimit: number;
  amount: number;
  paymentMethods: string[];
}

export interface AcceptOrderDto {
  orderId: string;
  buyerId: string;
  amount: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Проверка допустимости перехода состояния
   */
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return STATE_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * Создать новую заявку
   */
  async createOrder(data: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // Найти или создать пользователя
      let user = await tx.user.findUnique({
        where: { telegramId: data.telegramId },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            telegramId: data.telegramId,
            username: data.username || 'Аноним',
          },
        });
      }

      // Проверка баланса для продавца
      if (data.type === 'SELL' && user.balance < data.amount) {
        throw new ForbiddenException(
          `Недостаточно средств. Требуется: ${data.amount} USDT, Доступно: ${user.balance} USDT`,
        );
      }

      // Создать заявку
      const order = await tx.order.create({
        data: {
          userId: user.id,
          sellerId: data.type === 'SELL' ? user.id : null,
          buyerId: data.type === 'BUY' ? user.id : null,
          type: data.type,
          rate: data.rate,
          minLimit: data.minLimit,
          maxLimit: data.maxLimit,
          amount: data.amount,
          paymentMethods: data.paymentMethods,
          status: OrderStatus.PENDING,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
        },
        include: { user: true },
      });

      // Для продавцов сразу резервируем средства
      if (data.type === 'SELL') {
        await this.transactionsService.reserveFunds(
          order.id,
          user.id,
          data.amount,
        );
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.RESERVED,
            reservedAmount: data.amount,
          },
        });
      }

      this.logger.log(`Order created: ${order.id} by user ${user.id}`);
      
      // Отправляем уведомление
      this.notificationsService.notifyOrderCreated(order);
      
      return order;
    });
  }

  /**
   * Принять заявку (покупатель принимает заявку продавца)
   */
  async acceptOrder(data: AcceptOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: data.orderId },
        include: { seller: true },
      });

      if (!order) {
        throw new BadRequestException('Заявка не найдена');
      }

      if (!this.canTransition(order.status, OrderStatus.PAYMENT_PENDING)) {
        throw new BadRequestException(
          `Невозможно принять заявку в статусе ${order.status}`,
        );
      }

      if (order.type !== 'SELL') {
        throw new BadRequestException('Можно принимать только заявки на покупку');
      }

      const buyer = await tx.user.findUnique({
        where: { id: data.buyerId },
      });

      if (!buyer) {
        throw new BadRequestException('Покупатель не найден');
      }

      const totalAmount = data.amount * order.rate;

      // Проверка баланса покупателя
      if (buyer.balance < totalAmount) {
        throw new ForbiddenException(
          `Недостаточно средств. Требуется: ${totalAmount} USDT, Доступно: ${buyer.balance} USDT`,
        );
      }

      // Резервируем средства покупателя
      await this.transactionsService.reserveFunds(
        order.id,
        data.buyerId,
        totalAmount,
      );

      // Обновляем заявку
      const updatedOrder = await tx.order.update({
        where: { id: data.orderId },
        data: {
          buyerId: data.buyerId,
          status: OrderStatus.PAYMENT_PENDING,
          reservedAmount: order.reservedAmount + totalAmount,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 минут на оплату
        },
        include: {
          seller: true,
          buyer: true,
        },
      });

      this.logger.log(
        `Order ${order.id} accepted by buyer ${data.buyerId}`,
      );
      
      // Отправляем уведомление
      this.notificationsService.notifyOrderAccepted(updatedOrder, data.buyerId);
      
      return updatedOrder;
    });
  }

  /**
   * Подтвердить оплату (продавец подтверждает получение оплаты)
   */
  async confirmPayment(orderId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { seller: true, buyer: true },
      });

      if (!order) {
        throw new BadRequestException('Заявка не найдена');
      }

      if (order.sellerId !== userId) {
        throw new ForbiddenException('Только продавец может подтвердить оплату');
      }

      if (!this.canTransition(order.status, OrderStatus.PAID)) {
        throw new BadRequestException(
          `Невозможно подтвердить оплату в статусе ${order.status}`,
        );
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
        include: { seller: true, buyer: true },
      });

      this.logger.log(`Payment confirmed for order ${orderId}`);
      
      // Отправляем уведомление
      this.notificationsService.notifyPaymentConfirmed(updatedOrder);
      
      return updatedOrder;
    });
  }

  /**
   * Подтвердить получение средств (покупатель подтверждает)
   */
  async confirmReceipt(orderId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { seller: true, buyer: true },
      });

      if (!order) {
        throw new BadRequestException('Заявка не найдена');
      }

      if (order.buyerId !== userId) {
        throw new ForbiddenException('Только покупатель может подтвердить получение');
      }

      if (!this.canTransition(order.status, OrderStatus.CONFIRMED)) {
        throw new BadRequestException(
          `Невозможно подтвердить в статусе ${order.status}`,
        );
      }

      // Переводим средства продавцу
      const buyerPaymentAmount = order.amount * order.rate;
      await this.transactionsService.transferToSeller(
        orderId,
        order.sellerId,
        order.amount, // Переводим USDT продавцу
      );

      // Освобождаем средства покупателя (списываем навсегда)
      await tx.user.update({
        where: { id: order.buyerId },
        data: {
          blockedBalance: { decrement: buyerPaymentAmount },
        },
      });

      // Завершаем сделку
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED },
        include: { seller: true, buyer: true },
      });

      // Обновляем статистику
      await tx.user.update({
        where: { id: order.sellerId },
        data: { totalTrades: { increment: 1 } },
      });
      await tx.user.update({
        where: { id: order.buyerId },
        data: { totalTrades: { increment: 1 } },
      });

      this.logger.log(`Order ${orderId} completed successfully`);
      
      // Отправляем уведомление
      this.notificationsService.notifyReceiptConfirmed(updatedOrder);
      
      return updatedOrder;
    });
  }

  /**
   * Отменить заявку
   */
  async cancelOrder(orderId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { seller: true, buyer: true },
      });

      if (!order) {
        throw new BadRequestException('Заявка не найдена');
      }

      if (!this.canTransition(order.status, OrderStatus.CANCELLED)) {
        throw new BadRequestException(
          `Невозможно отменить заявку в статусе ${order.status}`,
        );
      }

      // Проверка прав
      if (order.sellerId !== userId && order.buyerId !== userId) {
        throw new ForbiddenException('Нет прав для отмены этой заявки');
      }

      // Возвращаем зарезервированные средства
      if (order.reservedAmount > 0) {
        const fundOwner = order.sellerId === userId ? order.sellerId : order.buyerId;
        await this.transactionsService.releaseFunds(
          orderId,
          fundOwner,
          order.reservedAmount,
        );
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      this.logger.log(`Order ${orderId} cancelled by user ${userId}`);
      
      // Отправляем уведомление
      this.notificationsService.notifyOrderCancelled(updatedOrder, userId);
      
      return updatedOrder;
    });
  }

  /**
   * Создать спор
   */
  async createDispute(
    orderId: string,
    userId: string,
    reason: string,
    description?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new BadRequestException('Заявка не найдена');
      }

      if (!this.canTransition(order.status, OrderStatus.DISPUTED)) {
        throw new BadRequestException(
          `Невозможно создать спор в статусе ${order.status}`,
        );
      }

      // Обновляем статус заказа
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DISPUTED },
      });

      // Создаём спор
      const dispute = await tx.dispute.create({
        data: {
          orderId,
          initiatorId: userId,
          reason,
          description,
          status: 'OPEN',
        },
        include: { initiator: true },
      });

      this.logger.log(`Dispute created for order ${orderId} by user ${userId}`);
      
      // Отправляем уведомление
      this.notificationsService.notifyDisputeCreated(dispute, order);
      
      return dispute;
    });
  }

  /**
   * Решить спор (админ)
   */
  async resolveDispute(
    orderId: string,
    adminId: string,
    resolution: string,
    winnerId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { seller: true, buyer: true },
      });

      if (!order) {
        throw new BadRequestException('Заявка не найдена');
      }

      if (order.status !== OrderStatus.DISPUTED) {
        throw new BadRequestException('Спор ещё не создан или уже решён');
      }

      // Обновляем спор
      await tx.dispute.update({
        where: { orderId },
        data: {
          status: 'RESOLVED',
          resolution,
          resolvedBy: adminId,
        },
      });

      // Возвращаем средства победителю
      const refundAmount = order.reservedAmount;
      await this.transactionsService.releaseFunds(
        orderId,
        winnerId,
        refundAmount,
      );

      // Обновляем заказ
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.RESOLVED },
      });

      this.logger.log(
        `Dispute resolved for order ${orderId}. Winner: ${winnerId}`,
      );
      
      // Отправляем уведомление
      this.notificationsService.notifyDisputeResolved(updatedOrder, resolution, winnerId);
      
      return updatedOrder;
    });
  }

  /**
   * Получить активные заявки
   */
  async getActiveOrders(filters?: { type?: string; payment?: string }) {
    const where: any = {
      status: {
        in: [OrderStatus.ACTIVE, OrderStatus.RESERVED, OrderStatus.PAYMENT_PENDING],
      },
    };

    if (filters?.type) {
      where.type = filters.type.toUpperCase();
    }

    if (filters?.payment) {
      where.paymentMethods = { has: filters.payment };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            reputationScore: true,
            totalTrades: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
            totalTrades: true,
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            reputationScore: true,
            totalTrades: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return orders;
  }

  /**
   * Скрыть заявку (админ)
   */
  async hideOrder(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.HIDDEN },
    });
  }

  /**
   * Получить заказ по ID
   */
  async getOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        seller: true,
        buyer: true,
        transactions: {
          orderBy: { createdAt: 'asc' },
        },
        dispute: true,
      },
    });
  }
}
