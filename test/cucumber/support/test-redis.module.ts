import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: {
        get: async () => null,
        set: async () => null,
        del: async () => null,
        expire: async () => null,
        incr: async () => 1,
        lpush: async () => null,
        lrange: async () => [],
        lrem: async () => null,
        sadd: async () => null,
        smembers: async () => [],
        srem: async () => null,
        keys: async () => [],
        exists: async () => 0,
        ttl: async () => -1,
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class TestRedisModule {}
