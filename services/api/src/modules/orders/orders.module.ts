import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { WsModule } from '../ws/ws.module';
import { FraudModule } from '../fraud/fraud.module';
import { SettlementModule } from './strategies/settlement.module';

@Module({
  imports: [
    TransactionsModule,
    WsModule,
    FraudModule,
    SettlementModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
