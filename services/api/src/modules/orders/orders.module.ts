import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { WsModule } from '../ws/ws.module';
import { FraudModule } from '../fraud/fraud.module';

@Module({
  imports: [TransactionsModule, WsModule, FraudModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
