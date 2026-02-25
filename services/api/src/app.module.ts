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
import { HealthModule } from './modules/health/health.module';
import { RedisModule } from './modules/redis/redis.module';
import { ThrottlerStorageRedisService } from './modules/redis/throttler-storage-redis.service';
import { JwtAuthModule } from './modules/auth/jwt-auth.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { DemoModule } from './modules/demo/demo.module';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redisStorage: ThrottlerStorageRedisService) => ({
        storage: redisStorage,
        throttlers: [
          {
            ttl: 60000,
            limit: 100,
          },
        ],
      }),
      inject: [ThrottlerStorageRedisService],
    }),
    PrismaModule,
    TransactionsModule,
    WsModule,
    FraudModule,
    RedisModule,
    HealthModule,
    JwtAuthModule,
    BlockchainModule,
    DemoModule,
    OrdersModule,
    WebhookModule,
    AdminModule,
    SseModule,
  ],
})
export class AppModule {
  configure(consumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
