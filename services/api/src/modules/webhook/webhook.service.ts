import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly ordersService: OrdersService) {}

  async processOrderWebhook(data: any, secret: string) {
    // Проверка секрета (должен совпадать с TELEGRAM_WEBHOOK_SECRET в .env)
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      throw new UnauthorizedException('Invalid secret');
    }

    this.logger.log(`Processing webhook: ${JSON.stringify(data)}`);

    try {
      const order = await this.ordersService.createOrder({
        telegramId: data.telegram_id,
        username: data.username,
        type: data.type === 'buy' ? 'BUY' : 'SELL',
        rate: data.rate,
        minLimit: data.min_limit,
        maxLimit: data.max_limit,
        amount: data.amount,
        paymentMethods: data.payment_methods || ['sbp'],
      });

      return { success: true, orderId: order.id };
    } catch (error) {
      this.logger.error(`Webhook failed: ${error.message}`);
      throw error;
    }
  }
}
