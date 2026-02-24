import { Controller, Sse, MessageEvent, Get, Query } from '@nestjs/common';
import { Observable, interval, map, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { OrdersService } from '../orders/orders.service';

@Controller('sse')
export class SseController {
  constructor(private ordersService: OrdersService) {}

  /**
   * SSE endpoint для обновлений заказов (альтернатива WebSocket)
   * Обновляем каждые 10 секунд
   */
  @Sse('orders')
  ordersStream(): Observable<MessageEvent> {
    return interval(10000).pipe(
      mergeMap(async () => {
        const orders = await this.ordersService.getActiveOrders();
        return {
          type: 'orders-update',
          data: JSON.stringify({
            orders,
            timestamp: new Date().toISOString(),
          }),
        } as MessageEvent;
      }),
    );
  }

  /**
   * SSE endpoint для конкретного заказа
   */
  @Sse('order/:id')
  orderStream(@Query('id') id: string): Observable<MessageEvent> {
    return interval(5000).pipe(
      mergeMap(async () => {
        const order = await this.ordersService.getOrderById(id);
        return {
          type: 'order-update',
          data: JSON.stringify({
            order,
            timestamp: new Date().toISOString(),
          }),
        } as MessageEvent;
      }),
    );
  }
}
