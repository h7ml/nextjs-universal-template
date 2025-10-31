// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P2-LD-004] 查询路由和缓存;
// 应用的原则: tRPC, Redis缓存;
// }}
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';
import { log } from '@/lib/logger';
import type { Redis } from '@upstash/redis';

const CACHE_TTL = 300; // 5分钟缓存

type RedisClient = Redis;
type CachedQueryPayload = {
  data: any[];
  columns: string[];
  rowCount: number;
};

let redisClientPromise: Promise<RedisClient | null> | null = null;

async function getRedisClient(): Promise<RedisClient | null> {
  const hasRedisConfig = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  if (!hasRedisConfig) {
    return null;
  }

  if (!redisClientPromise) {
    redisClientPromise = import('@upstash/redis')
      .then(({ Redis }) => {
        try {
          return Redis.fromEnv();
        } catch (error) {
          log.warn('Failed to initialize Redis client from environment', {
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        }
      })
      .catch((error) => {
        log.warn('Failed to load @upstash/redis', {
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      });
  }

  return redisClientPromise;
}

export const queryRouter = router({
  // 执行SQL查询
  execute: protectedProcedure
    .input(
      z.object({
        sql: z.string(),
        useCache: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      const redis = input.useCache ? await getRedisClient() : null;

      try {
        // 基本SQL验证（禁止危险操作）
        const normalizedSql = input.sql.trim().toUpperCase();
        const dangerousKeywords = ['DROP', 'TRUNCATE', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE'];
        
        for (const keyword of dangerousKeywords) {
          if (normalizedSql.startsWith(keyword)) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: `${keyword} operations are not allowed in query editor`,
            });
          }
        }

        // 缓存键
        const cacheKey = `query:${crypto.createHash('md5').update(input.sql).digest('hex')}`;

        // 检查缓存
        if (input.useCache && redis) {
          try {
            const cachedRaw = await redis.get<string>(cacheKey);

            if (cachedRaw) {
              let cached: CachedQueryPayload | null = null;

              try {
                cached = typeof cachedRaw === 'string'
                  ? (JSON.parse(cachedRaw) as CachedQueryPayload)
                  : (cachedRaw as unknown as CachedQueryPayload);
              } catch (parseError) {
                log.warn('Failed to parse cached query payload', {
                  cacheKey,
                  error: parseError instanceof Error ? parseError.message : String(parseError),
                });
              }

              if (cached) {
                log.debug('Query cache hit', { cacheKey });
                return {
                  success: true,
                  data: cached.data,
                  columns: cached.columns,
                  rowCount: cached.rowCount,
                  duration: Date.now() - startTime,
                  cached: true,
                };
              }
            }
          } catch (cacheError) {
            log.warn('Cache read error', {
              cacheKey,
              error: cacheError instanceof Error ? cacheError.message : String(cacheError),
            });
          }
        }

        // 执行查询
        const result = await db.execute(sql.raw(input.sql));
        
        const data = result.rows || [];
        const columns = data.length > 0 ? Object.keys(data[0]) : [];

        // 保存到缓存
        if (input.useCache && redis && data.length > 0) {
          try {
            const payload: CachedQueryPayload = {
              data,
              columns,
              rowCount: data.length,
            };

            await redis.set(cacheKey, JSON.stringify(payload), { ex: CACHE_TTL });
            log.debug('Query result cached', { cacheKey, ttl: CACHE_TTL });
          } catch (cacheError) {
            log.warn('Cache write error', {
              cacheKey,
              error: cacheError instanceof Error ? cacheError.message : String(cacheError),
            });
          }
        }

        const duration = Date.now() - startTime;

        // 记录到历史
        // TODO: 保存到数据库的查询历史表

        log.info('Query executed', {
          userId: ctx.user.id,
          sql: input.sql,
          rowCount: data.length,
          duration,
        });

        return {
          success: true,
          data,
          columns,
          rowCount: data.length,
          duration,
          cached: false,
        };
      } catch (error: any) {
        const duration = Date.now() - startTime;

        log.error('Query execution failed', {
          userId: ctx.user.id,
          sql: input.sql,
          error: error.message,
          duration,
        });

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Query execution failed',
        });
      }
    }),

  // 获取查询历史
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: 从数据库读取实际历史记录
      // 这里返回模拟数据
      return {
        items: [],
        total: 0,
      };
    }),

  // 保存收藏的查询
  saveFavorite: protectedProcedure
    .input(
      z.object({
        sql: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: 保存到数据库
      log.info('Query saved to favorites', {
        userId: ctx.user.id,
        sql: input.sql,
        name: input.name,
      });

      return {
        success: true,
        id: crypto.randomUUID(),
      };
    }),

  // 获取收藏的查询
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    // TODO: 从数据库读取
    return {
      items: [],
      total: 0,
    };
  }),

  // 删除收藏
  deleteFavorite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: 从数据库删除
      log.info('Query removed from favorites', {
        userId: ctx.user.id,
        favoriteId: input.id,
      });

      return { success: true };
    }),

  // 清除查询缓存
  clearCache: protectedProcedure
    .input(z.object({ pattern: z.string().optional() }))
    .mutation(async ({ input }) => {
      const redis = await getRedisClient();

      if (!redis) {
        return { success: false, message: 'Redis not configured' };
      }

      try {
        // 清除所有查询缓存
        const pattern = input.pattern || 'query:*';
        const keys = await redis.keys(pattern);
        
        if (keys.length > 0) {
          await redis.del(...keys);
          log.info('Query cache cleared', { pattern, count: keys.length });
        }

        return {
          success: true,
          clearedCount: keys.length,
        };
      } catch (error: any) {
        log.error('Failed to clear cache', {
          error: error.message,
        });
        return {
          success: false,
          message: error.message,
        };
      }
    }),
});
