import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Telegram webhook для создания заявок' })
  @ApiHeader({
    name: 'x-telegram-bot-secret',
    required: true,
    description: 'Секретный токен для проверки webhook',
  })
  @ApiHeader({
    name: 'x-telegram-timestamp',
    required: false,
    description: 'Timestamp для защиты от replay-атак',
  })
  @ApiResponse({ status: 200, description: 'Заявка создана' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Неверный секрет' })
  async handleOrderWebhook(
    @Body() body: any,
    @Headers('x-telegram-bot-secret') secret: string,
    @Headers('x-telegram-timestamp') timestamp?: string,
    @Headers('x-telegram-signature') signature?: string,
  ) {
    this.logger.log(`Webhook received from Telegram`);

    try {
      return await this.webhookService.processOrderWebhook(
        body,
        secret,
        timestamp,
        signature,
      );
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      throw error;
    }
  }
}
