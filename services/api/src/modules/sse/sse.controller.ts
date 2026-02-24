import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { OrdersService } from '../orders/orders.service';

@Controller('sse')
export class SseController {
  constructor(private ordersService: OrdersService) {}

  @Sse('orders')
  ordersStream(): Observable<MessageEvent> {
    // Обновляем каждые 10 секунд
    return interval(10000).pipe(
      map(async () => {
        const orders = await this.ordersService.getActiveOrders();
        return {
          type: 'orders',
          data: orders,
        } as MessageEvent;
      }),
    );
  }
}
