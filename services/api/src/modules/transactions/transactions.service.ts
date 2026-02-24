import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType, OrderStatus } from '@prisma/client';

export interface CreateTransactionDto {
  orderId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Создать транзакцию с обновлением баланса (атомарно)
   */
  async createTransaction(data: CreateTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const balanceBefore = user.balance;
      let balanceAfter = balanceBefore;

      // Обновляем баланс в зависимости от типа транзакции
      switch (data.type) {
        case TransactionType.RESERVE:
        case TransactionType.ESCROW:
          balanceAfter = balanceBefore - data.amount;
          break;
        case TransactionType.RELEASE:
        case TransactionType.REFUND:
          balanceAfter = balanceBefore + data.amount;
          break;
        case TransactionType.PAYMENT:
          // Платёж не меняет баланс, просто фиксируется
          balanceAfter = balanceBefore;
          break;
      }

      // Проверка достаточности средств
      if (balanceAfter < 0) {
        throw new ForbiddenException('Insufficient balance');
      }

      // Создаём транзакцию
      const transaction = await tx.transaction.create({
        data: {
          orderId: data.orderId,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          balanceBefore,
          balanceAfter,
          description: data.description,
          metadata: data.metadata,
        },
      });

      // Обновляем баланс пользователя
      await tx.user.update({
        where: { id: data.userId },
        data: {
          balance: balanceAfter,
        },
      });

      this.logger.log(
        `Transaction created: ${data.type} ${data.amount} USDT for user ${data.userId}`,
      );

      return transaction;
    });
  }

  /**
   * Резервирование средств на эскроу
   */
  async reserveFunds(orderId: string, userId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.balance < amount) {
        throw new ForbiddenException('Insufficient balance for reserve');
      }

      // Блокируем средства
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: amount },
          blockedBalance: { increment: amount },
        },
      });

      // Создаём транзакцию
      const transaction = await tx.transaction.create({
        data: {
          orderId,
          userId,
          type: TransactionType.RESERVE,
          amount,
          balanceBefore: user.balance,
          balanceAfter: user.balance - amount,
          description: 'Резервирование средств для сделки',
          metadata: { orderId },
        },
      });

      this.logger.log(`Reserved ${amount} USDT for order ${orderId}`);
      return transaction;
    });
  }

  /**
   * Освобождение зарезервированных средств (возврат на баланс)
   */
  async releaseFunds(orderId: string, userId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.blockedBalance < amount) {
        throw new ForbiddenException('Insufficient blocked balance');
      }

      // Разблокируем средства
      await tx.user.update({
        where: { id: userId },
        data: {
          blockedBalance: { decrement: amount },
          balance: { increment: amount },
        },
      });

      // Создаём транзакцию
      const transaction = await tx.transaction.create({
        data: {
          orderId,
          userId,
          type: TransactionType.RELEASE,
          amount,
          balanceBefore: user.balance,
          balanceAfter: user.balance + amount,
          description: 'Освобождение зарезервированных средств',
          metadata: { orderId },
        },
      });

      this.logger.log(`Released ${amount} USDT for order ${orderId}`);
      return transaction;
    });
  }

  /**
   * Перевод средств продавцу (после подтверждения сделки)
   */
  async transferToSeller(orderId: string, sellerId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const seller = await tx.user.findUnique({
        where: { id: sellerId },
      });

      if (!seller) {
        throw new BadRequestException('Seller not found');
      }

      // Снимаем с заблокированного баланса продавца
      await tx.user.update({
        where: { id: sellerId },
        data: {
          blockedBalance: { decrement: amount },
        },
      });

      // Создаём транзакцию
      const transaction = await tx.transaction.create({
        data: {
          orderId,
          userId: sellerId,
          type: TransactionType.RELEASE,
          amount,
          balanceBefore: seller.balance,
          balanceAfter: seller.balance,
          description: 'Получение средств от сделки',
          metadata: { orderId, role: 'seller' },
        },
      });

      // Обновляем статистику продавца
      await tx.user.update({
        where: { id: sellerId },
        data: {
          totalTrades: { increment: 1 },
        },
      });

      this.logger.log(`Transferred ${amount} USDT to seller ${sellerId}`);
      return transaction;
    });
  }

  /**
   * Возврат средств покупателю (при отмене или споре)
   */
  async refundToBuyer(orderId: string, buyerId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const buyer = await tx.user.findUnique({
        where: { id: buyerId },
      });

      if (!buyer) {
        throw new BadRequestException('Buyer not found');
      }

      // Разблокируем и возвращаем средства
      await tx.user.update({
        where: { id: buyerId },
        data: {
          blockedBalance: { decrement: amount },
          balance: { increment: amount },
        },
      });

      // Создаём транзакцию
      const transaction = await tx.transaction.create({
        data: {
          orderId,
          userId: buyerId,
          type: TransactionType.REFUND,
          amount,
          balanceBefore: buyer.balance,
          balanceAfter: buyer.balance + amount,
          description: 'Возврат средств покупателю',
          metadata: { orderId, role: 'buyer' },
        },
      });

      this.logger.log(`Refunded ${amount} USDT to buyer ${buyerId}`);
      return transaction;
    });
  }

  /**
   * Получить историю транзакций пользователя
   */
  async getUserTransactions(userId: string, limit: number = 50) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Получить транзакции по заказу
   */
  async getOrderTransactions(orderId: string) {
    return this.prisma.transaction.findMany({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
