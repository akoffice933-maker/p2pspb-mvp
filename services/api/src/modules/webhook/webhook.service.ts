import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { FraudDetectionService } from '../fraud/fraud-detection.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  // Храним timestamp последних запросов для защиты от replay-атак
  private readonly recentTimestamps = new Map<string, number>();
  private readonly TIMESTAMP_WINDOW = 5 * 60 * 1000; // 5 минут

  constructor(
    private readonly ordersService: OrdersService,
    private readonly fraudDetectionService: FraudDetectionService,
  ) {}

  async processOrderWebhook(
    data: any,
    secret: string,
    timestamp?: string,
    signature?: string,
  ) {
    // 1. Проверка секретного токена
    if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      this.logger.warn('Invalid webhook secret');
      throw new UnauthorizedException('Invalid secret');
    }

    // 2. Проверка timestamp для защиты от replay-атак
    if (timestamp) {
      const now = Date.now();
      const timestampMs = parseInt(timestamp, 10);

      if (isNaN(timestampMs)) {
        throw new BadRequestException('Invalid timestamp');
      }

      // Проверяем что timestamp в допустимом окне
      if (Math.abs(now - timestampMs) > this.TIMESTAMP_WINDOW) {
        this.logger.warn(`Webhook timestamp out of window: ${timestamp}`);
        throw new BadRequestException('Timestamp expired');
      }

      // Проверяем что этот timestamp ещё не использовался
      if (this.recentTimestamps.has(timestamp)) {
        this.logger.warn(`Replay attack detected: ${timestamp}`);
        throw new BadRequestException('Duplicate timestamp');
      }

      // Сохраняем timestamp
      this.recentTimestamps.set(timestamp, timestampMs);

      // Очищаем старые timestamp (каждые 5 минут)
      if (this.recentTimestamps.size > 1000) {
        const cutoff = now - this.TIMESTAMP_WINDOW;
        for (const [key, value] of this.recentTimestamps.entries()) {
          if (value < cutoff) {
            this.recentTimestamps.delete(key);
          }
        }
      }
    }

    // 3. Валидация данных
    const validationError = this.validateWebhookData(data);
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    this.logger.log(`Processing webhook: ${JSON.stringify(data)}`);

    try {
      // 4. Anti-fraud проверка
      const fraudCheck = await this.fraudDetectionService.checkBeforeCreateOrder(
        data.telegram_id,
        data.amount,
        data.ip_address,
        data.fingerprint,
      );

      if (fraudCheck.isFraud) {
        this.logger.warn(`Fraud detected: ${fraudCheck.reasons.join('; ')}`);
        return {
          success: false,
          error: 'Fraud detected',
          reasons: fraudCheck.reasons,
        };
      }

      // 5. Создаём заявку
      const order = await this.ordersService.createOrder(
        {
          telegramId: data.telegram_id,
          username: data.username,
          type: data.type === 'buy' ? 'BUY' : 'SELL',
          rate: parseFloat(data.rate),
          minLimit: parseFloat(data.min_limit),
          maxLimit: parseFloat(data.max_limit),
          amount: parseFloat(data.amount),
          paymentMethods: data.payment_methods || ['sbp'],
        },
        data.ip_address,
        data.fingerprint,
      );

      this.logger.log(`Order created: ${order.id}`);
      return { success: true, orderId: order.id };
    } catch (error) {
      this.logger.error(`Webhook failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private validateWebhookData(data: any): string | null {
    if (!data.telegram_id) {
      return 'telegram_id is required';
    }

    if (!data.type || !['buy', 'sell'].includes(data.type.toLowerCase())) {
      return 'type must be buy or sell';
    }

    if (!data.rate || isNaN(parseFloat(data.rate))) {
      return 'rate must be a number';
    }

    if (!data.amount || isNaN(parseFloat(data.amount))) {
      return 'amount must be a number';
    }

    if (parseFloat(data.amount) <= 0) {
      return 'amount must be positive';
    }

    if (data.min_limit && isNaN(parseFloat(data.min_limit))) {
      return 'min_limit must be a number';
    }

    if (data.max_limit && isNaN(parseFloat(data.max_limit))) {
      return 'max_limit must be a number';
    }

    if (data.min_limit && data.max_limit) {
      if (parseFloat(data.min_limit) > parseFloat(data.max_limit)) {
        return 'min_limit cannot be greater than max_limit';
      }
    }

    return null;
  }
}
