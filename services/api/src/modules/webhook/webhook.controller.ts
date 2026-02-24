import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('order')
  @HttpCode(HttpStatus.OK)
  async handleOrderWebhook(
    @Body() body: any,
    @Headers('x-telegram-bot-secret') secret: string,
  ) {
    return this.webhookService.processOrderWebhook(body, secret);
  }
}
