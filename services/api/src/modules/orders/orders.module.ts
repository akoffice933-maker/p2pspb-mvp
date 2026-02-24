import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { WsModule } from '../ws/ws.module';

@Module({
  imports: [TransactionsModule, WsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
