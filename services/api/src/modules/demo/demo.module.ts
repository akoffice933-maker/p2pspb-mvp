import { Module } from '@nestjs/common';
import { DemoService } from './demo.service';
import { OrdersModule } from '../orders/orders.module';
import { WsModule } from '../ws/ws.module';

@Module({
  imports: [OrdersModule, WsModule],
  providers: [DemoService],
  exports: [DemoService],
})
export class DemoModule {}
