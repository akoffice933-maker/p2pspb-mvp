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
  Headers,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список активных заявок с пагинацией' })
  @ApiQuery({ name: 'type', required: false, enum: ['BUY', 'SELL'] })
  @ApiQuery({ name: 'payment', required: false, description: 'Способ оплаты (sbp, cash)' })
  @ApiQuery({ name: 'page', required: false, description: 'Номер страницы', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Элементов на страницу', example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'rate', 'amount'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Список заявок с пагинацией' })
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getOrders(
    @Query('type') type?: string,
    @Query('payment') payment?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'createdAt' | 'rate' | 'amount',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.ordersService.getActiveOrders({
      type,
      payment,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детали заказа по ID' })
  @ApiResponse({ status: 200, description: 'Детали заказа' })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Создать новую заявку' })
  @ApiHeader({ name: 'x-fingerprint', required: false, description: 'Отпечаток устройства' })
  @ApiResponse({ status: 201, description: 'Заявка создана' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 403, description: 'Отклонено анти-фрод системой' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createOrder(@Req() req: Request, @Body() body: any, @Headers('x-fingerprint') fingerprint?: string) {
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

    const ipAddress = req.ip || req.socket.remoteAddress;

    return this.ordersService.createOrder({
      telegramId: telegram_id,
      username,
      type: type.toUpperCase(),
      rate: parseFloat(rate),
      minLimit: parseFloat(min_limit || 0),
      maxLimit: parseFloat(max_limit || Infinity),
      amount: parseFloat(amount),
      paymentMethods: payment_methods || ['sbp'],
    }, ipAddress, fingerprint);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Принять заявку (покупатель)' })
  @ApiResponse({ status: 200, description: 'Заявка принята' })
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
  @ApiOperation({ summary: 'Подтвердить оплату (продавец)' })
  @ApiResponse({ status: 200, description: 'Оплата подтверждена' })
  async confirmPayment(
    @Param('id') id: string,
    @Body() body: { user_id: string },
  ) {
    return this.ordersService.confirmPayment(id, body.user_id);
  }

  @Post(':id/confirm-receipt')
  @ApiOperation({ summary: 'Подтвердить получение (покупатель)' })
  @ApiResponse({ status: 200, description: 'Получение подтверждено' })
  async confirmReceipt(
    @Param('id') id: string,
    @Body() body: { user_id: string },
  ) {
    return this.ordersService.confirmReceipt(id, body.user_id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Отменить заявку' })
  @ApiResponse({ status: 200, description: 'Заявка отменена' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { user_id: string },
  ) {
    return this.ordersService.cancelOrder(id, body.user_id);
  }

  @Post(':id/dispute')
  @ApiOperation({ summary: 'Создать спор' })
  @ApiResponse({ status: 200, description: 'Спор создан' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Скрыть заявку (админ)' })
  @ApiResponse({ status: 200, description: 'Заявка скрыта' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async hideOrder(@Param('id') id: string) {
    return this.ordersService.hideOrder(id);
  }
}
