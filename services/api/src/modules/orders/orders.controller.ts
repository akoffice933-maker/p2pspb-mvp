import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getOrders(
    @Query('type') type?: string,
    @Query('payment') payment?: string,
  ) {
    return this.ordersService.getActiveOrders({ type, payment });
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Post('create')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createOrder(@Body() body: any) {
    // Валидация входных данных
    const {
      telegram_id,
      username,
      type,
      rate,
      min_limit,
      max_limit,
      amount,
      payment_methods,
    } = body;

    if (!telegram_id || !type || !rate || !amount) {
      throw new BadRequestException(
        'Требуемые поля: telegram_id, type, rate, amount',
      );
    }

    return this.ordersService.createOrder({
      telegramId: telegram_id,
      username,
      type: type.toUpperCase(),
      rate: parseFloat(rate),
      minLimit: parseFloat(min_limit || 0),
      maxLimit: parseFloat(max_limit || Infinity),
      amount: parseFloat(amount),
      paymentMethods: payment_methods || ['sbp'],
    });
  }

  @Post(':id/accept')
  async acceptOrder(
    @Param('id') id: string,
    @Body() body: { buyer_id: string; amount: number },
  ) {
    return this.ordersService.acceptOrder({
      orderId: id,
      buyerId: body.buyer_id,
      amount: body.amount,
    });
  }

  @Post(':id/confirm-payment')
  async confirmPayment(
    @Param('id') id: string,
    @Body() body: { user_id: string },
  ) {
    return this.ordersService.confirmPayment(id, body.user_id);
  }

  @Post(':id/confirm-receipt')
  async confirmReceipt(
    @Param('id') id: string,
    @Body() body: { user_id: string },
  ) {
    return this.ordersService.confirmReceipt(id, body.user_id);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { user_id: string },
  ) {
    return this.ordersService.cancelOrder(id, body.user_id);
  }

  @Post(':id/dispute')
  async createDispute(
    @Param('id') id: string,
    @Body() body: { user_id: string; reason: string; description?: string },
  ) {
    return this.ordersService.createDispute(
      id,
      body.user_id,
      body.reason,
      body.description,
    );
  }

  @Post(':id/hide')
  @UseGuards(AdminGuard)
  async hideOrder(@Param('id') id: string) {
    return this.ordersService.hideOrder(id);
  }
}
