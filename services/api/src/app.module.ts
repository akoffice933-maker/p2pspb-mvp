import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { OrdersModule } from './modules/orders/orders.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { AdminModule } from './modules/admin/admin.module';
import { SseModule } from './modules/sse/sse.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WsModule } from './modules/ws/ws.module';
import { FraudModule } from './modules/fraud/fraud.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
    PrismaModule,
    TransactionsModule,
    WsModule,
    FraudModule,
    OrdersModule,
    WebhookModule,
    AdminModule,
    SseModule,
  ],
})
export class AppModule {}
