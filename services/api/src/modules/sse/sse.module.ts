import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [SseController],
})
export class SseModule {}
