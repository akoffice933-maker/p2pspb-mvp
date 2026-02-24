import { Injectable, Logger } from '@nestjs/common';
import { TradesGateway } from './trades.gateway';

export interface OrderUpdateEvent {
  orderId: string;
  type: 'ORDER_CREATED' | 'ORDER_ACCEPTED' | 'PAYMENT_CONFIRMED' | 'RECEIPT_CONFIRMED' | 'ORDER_CANCELLED' | 'DISPUTE_CREATED' | 'DISPUTE_RESOLVED';
  status: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface NotificationEvent {
  userId: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly tradesGateway: TradesGateway) {}

  /**
   * Отправить обновление статуса заказа всем участникам сделки
   */
  sendOrderUpdate(event: OrderUpdateEvent) {
    this.logger.log(
      `Sending order update: ${event.type} for order ${event.orderId}`,
    );

    // Отправляем в комнату сделки
    this.tradesGateway.server
      .to(`trade:${event.orderId}`)
      .emit('order-update', event);

    // Также отправляем в общие заказы (для обновления списка)
    this.tradesGateway.server.to('orders').emit('order-update', event);
  }

  /**
   * Отправить персональное уведомление пользователю
   */
  sendNotification(event: NotificationEvent) {
    this.logger.log(
      `Sending notification to user ${event.userId}: ${event.title}`,
    );

    // Отправляем в личную комнату пользователя
    this.tradesGateway.server
      .to(`user:${event.userId}`)
      .emit('notification', event);
  }

  /**
   * Отправить уведомление о новом заказе
   */
  notifyOrderCreated(order: any) {
    this.sendOrderUpdate({
      orderId: order.id,
      type: 'ORDER_CREATED',
      status: order.status,
      data: {
        type: order.type,
        rate: order.rate,
        amount: order.amount,
        seller: order.seller?.username || order.user?.username,
      },
      timestamp: new Date().toISOString(),
    });

    // Уведомляем продавца
    if (order.sellerId || order.userId) {
      this.sendNotification({
        userId: order.sellerId || order.userId,
        type: 'SUCCESS',
        title: 'Заявка создана',
        message: `Ваша заявка на ${order.type === 'BUY' ? 'покупку' : 'продажу'} создана`,
        data: { orderId: order.id },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Отправить уведомление о принятии заказа
   */
  notifyOrderAccepted(order: any, buyerId: string) {
    this.sendOrderUpdate({
      orderId: order.id,
      type: 'ORDER_ACCEPTED',
      status: order.status,
      data: {
        buyer: order.buyer?.username,
        amount: order.amount,
      },
      timestamp: new Date().toISOString(),
    });

    // Уведомляем продавца
    this.sendNotification({
      userId: order.sellerId,
      type: 'INFO',
      title: 'Заявка принята',
      message: `Покупатель принял вашу заявку`,
      data: { orderId: order.id, buyerId },
      timestamp: new Date().toISOString(),
    });

    // Уведомляем покупателя
    this.sendNotification({
      userId: buyerId,
      type: 'INFO',
      title: 'Заявка принята',
      message: `Вы приняли заявку #${order.id.slice(0, 8)}`,
      data: { orderId: order.id },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Отправить уведомление о подтверждении оплаты
   */
  notifyPaymentConfirmed(order: any) {
    this.sendOrderUpdate({
      orderId: order.id,
      type: 'PAYMENT_CONFIRMED',
      status: order.status,
      data: {
        confirmedBy: order.seller?.username,
      },
      timestamp: new Date().toISOString(),
    });

    // Уведомляем покупателя
    this.sendNotification({
      userId: order.buyerId,
      type: 'SUCCESS',
      title: 'Оплата подтверждена',
      message: 'Продавец подтвердил получение оплаты',
      data: { orderId: order.id },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Отправить уведомление о подтверждении получения
   */
  notifyReceiptConfirmed(order: any) {
    this.sendOrderUpdate({
      orderId: order.id,
      type: 'RECEIPT_CONFIRMED',
      status: order.status,
      data: {
        confirmedBy: order.buyer?.username,
      },
      timestamp: new Date().toISOString(),
    });

    // Уведомляем продавца
    this.sendNotification({
      userId: order.sellerId,
      type: 'SUCCESS',
      title: 'Сделка завершена',
      message: 'Покупатель подтвердил получение средств',
      data: { orderId: order.id },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Отправить уведомление об отмене заказа
   */
  notifyOrderCancelled(order: any, cancelledBy: string) {
    this.sendOrderUpdate({
      orderId: order.id,
      type: 'ORDER_CANCELLED',
      status: order.status,
      data: {
        cancelledBy,
      },
      timestamp: new Date().toISOString(),
    });

    // Уведомляем обе стороны
    const notification = {
      type: 'WARNING' as const,
      title: 'Заявка отменена',
      message: 'Заявка была отменена',
      data: { orderId: order.id },
      timestamp: new Date().toISOString(),
    };

    if (order.sellerId) {
      this.sendNotification({ ...notification, userId: order.sellerId });
    }
    if (order.buyerId) {
      this.sendNotification({ ...notification, userId: order.buyerId });
    }
  }

  /**
   * Отправить уведомление о создании спора
   */
  notifyDisputeCreated(dispute: any, order: any) {
    this.sendOrderUpdate({
      orderId: order.id,
      type: 'DISPUTE_CREATED',
      status: order.status,
      data: {
        reason: dispute.reason,
        initiator: dispute.initiator?.username,
      },
      timestamp: new Date().toISOString(),
    });

    // Уведомляем обе стороны
    const notification = {
      type: 'ERROR' as const,
      title: 'Создан спор',
      message: `Причина: ${dispute.reason}`,
      data: { orderId: order.id, disputeId: dispute.id },
      timestamp: new Date().toISOString(),
    };

    if (order.sellerId) {
      this.sendNotification({ ...notification, userId: order.sellerId });
    }
    if (order.buyerId) {
      this.sendNotification({ ...notification, userId: order.buyerId });
    }

    // Уведомляем админов (в общую комнату)
    this.tradesGateway.server.to('admins').emit('dispute-created', {
      disputeId: dispute.id,
      orderId: order.id,
      reason: dispute.reason,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Отправить уведомление о решении спора
   */
  notifyDisputeResolved(order: any, resolution: string, winnerId: string) {
    this.sendOrderUpdate({
      orderId: order.id,
      type: 'DISPUTE_RESOLVED',
      status: order.status,
      data: {
        resolution,
        winner: winnerId,
      },
      timestamp: new Date().toISOString(),
    });

    // Уведомляем обе стороны
    const notification = {
      type: winnerId ? 'SUCCESS' : 'WARNING',
      title: 'Спор решён',
      message: resolution,
      data: { orderId: order.id },
      timestamp: new Date().toISOString(),
    };

    if (order.sellerId) {
      this.sendNotification({ ...notification, userId: order.sellerId });
    }
    if (order.buyerId) {
      this.sendNotification({ ...notification, userId: order.buyerId });
    }
  }

  /**
   * Отправить массовое обновление списка заказов
   */
  broadcastOrdersUpdate(orders: any[]) {
    this.tradesGateway.server.to('orders').emit('orders-update', {
      orders,
      timestamp: new Date().toISOString(),
    });
  }
}
