import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Throttle } from '@nestjs/throttler';

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
}
