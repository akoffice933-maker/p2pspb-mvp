import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorage {
  constructor(private redisService: RedisService) {}

  async increment(key: string, ttl: number): Promise<{ totalHits: number; timeToExpire: number }> {
    const timeToExpire = Math.ceil(ttl / 1000);
    const keyWithPrefix = `throttle:${key}`;

    const multi = this.redisService.multi();
    multi.incr(keyWithPrefix);
    multi.expire(keyWithPrefix, timeToExpire);

    const results = await multi.exec();
    const totalHits = results?.[0]?.[1] as number;

    const timeToExpireRemaining = await this.redisService.ttl(keyWithPrefix);

    return {
      totalHits,
      timeToExpire: timeToExpireRemaining,
    };
  }
}
