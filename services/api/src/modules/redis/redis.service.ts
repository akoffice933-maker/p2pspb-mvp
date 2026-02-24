import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor() {
    super({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 50, 2000);
      },
    });
  }

  async onModuleInit() {
    try {
      await this.ping();
      console.log('Redis connected');
    } catch (error) {
      console.error('Redis connection failed:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.quit();
  }

  getClient(): Redis {
    return this;
  }
}
