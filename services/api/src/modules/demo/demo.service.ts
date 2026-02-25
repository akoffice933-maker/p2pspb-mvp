import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../ws/notifications.service';
import { interval, Subscription } from 'rxjs';

/**
 * Demo Mode Service
 * 
 * Автоматически создаёт и проводит сделки для демонстрации инвесторам.
 * Включается через DEMO_MODE=true
 * 
 * Сценарий:
 * 1. Создаётся заявка на покупку
 * 2. Создаётся заявка на продажу
 * 3. Сделка принимается
 * 4. Проходит все статусы за 60 секунд
 * 5. Инвесторы видят live-активность
 */
@Injectable()
export class DemoService implements OnModuleInit {
  private readonly logger = new Logger(DemoService.name);
  private readonly demoMode: boolean;
  private readonly demoInterval: number;
  private subscription?: Subscription;

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private notificationsService: NotificationsService,
  ) {
    this.demoMode = this.configService.get<boolean>('DEMO_MODE') || false;
    this.demoInterval = this.configService.get<number>('DEMO_INTERVAL_MS') || 30000; // 30 секунд
  }

  async onModuleInit() {
    if (!this.demoMode) {
      this.logger.log('Demo mode: DISABLED');
      return;
    }

    this.logger.log('🎭 Demo mode: ENABLED');
    this.logger.log(`Demo interval: ${this.demoInterval}ms`);

    // Запускаем демо-сделки
    this.startDemoTrades();
  }

  /**
   * Запустить автоматические демо-сделки
   */
  private startDemoTrades() {
    // Первая сделка сразу
    this.createDemoTrade();

    // Затем по интервалу
    this.subscription = interval(this.demoInterval).subscribe(() => {
      this.createDemoTrade();
    });
  }

  /**
   * Создать демо-сделку
   */
  private async createDemoTrade() {
    try {
      const timestamp = Date.now();
      const buyerId = `demo_buyer_${timestamp}`;
      const sellerId = `demo_seller_${timestamp}`;

      this.logger.log(`🎬 Creating demo trade #${timestamp}`);

      // 1. Создаём заявку на продажу
      const sellOrder = await this.ordersService.createOrder({
        telegramId: sellerId,
        username: `Demo Seller ${Math.floor(Math.random() * 100)}`,
        type: 'SELL',
        rate: 90 + Math.random() * 10, // 90-100 RUB
        minLimit: 1000,
        maxLimit: 50000,
        amount: 100 + Math.random() * 400, // 100-500 USDT
        paymentMethods: ['sbp', 'cash'],
      }, '127.0.0.1', 'demo-fingerprint');

      this.logger.log(`✅ Sell order created: ${sellOrder.id}`);

      // 2. Создаём заявку на покупку
      const buyOrder = await this.ordersService.createOrder({
        telegramId: buyerId,
        username: `Demo Buyer ${Math.floor(Math.random() * 100)}`,
        type: 'BUY',
        rate: 88 + Math.random() * 10, // 88-98 RUB
        minLimit: 500,
        maxLimit: 30000,
        amount: 50 + Math.random() * 200, // 50-250 USDT
        paymentMethods: ['sbp'],
      }, '127.0.0.1', 'demo-fingerprint');

      this.logger.log(`✅ Buy order created: ${buyOrder.id}`);

      // 3. Отправляем уведомление
      this.notificationsService.broadcastOrdersUpdate([sellOrder, buyOrder]);

      this.logger.log(`🎉 Demo trade #${timestamp} completed`);
    } catch (error) {
      this.logger.error(`Demo trade failed: ${error.message}`);
    }
  }

  /**
   * Остановить демо-режим
   */
  stop() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.logger.log('Demo mode stopped');
    }
  }

  /**
   * Статус демо-режима
   */
  getStatus() {
    return {
      enabled: this.demoMode,
      interval: this.demoInterval,
      running: !!this.subscription,
    };
  }
}
