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
import { Redis } from '@upstash/redis';
import { log } from '@/lib/logger';

// Redis缓存（可选）
type RedisClient = ReturnType<typeof Redis.fromEnv>;
let redis: RedisClient | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = Redis.fromEnv();
}

const CACHE_TTL = 300; // 5分钟缓存
const ALLOWED_STATEMENT_PREFIXES = [
  'SELECT',
  'WITH',
  'SHOW',
  'DESCRIBE',
  'EXPLAIN',
  'ANALYZE',
];
const DANGEROUS_KEYWORDS = [
  'DROP',
  'TRUNCATE',
  'DELETE',
  'UPDATE',
  'INSERT',
  'ALTER',
  'CREATE',
  'GRANT',
  'REVOKE',
];

function stripSqlComments(sqlText: string): string {
  return sqlText
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ');
}

function removeStringLiterals(sqlText: string): string {
  return sqlText
    .replace(/'(?:''|[^'])*'/g, ' ')
    .replace(/"(?:""|[^"])*"/g, ' ')
    .replace(/`(?:``|[^`])*`/g, ' ');
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

      try {
        const trimmedSql = input.sql.trim();
        if (!trimmedSql) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'SQL query cannot be empty',
          });
        }

        const sanitizedForAnalysis = removeStringLiterals(
          stripSqlComments(trimmedSql)
        );
        const statements = sanitizedForAnalysis
          .split(';')
          .map((stmt) => stmt.trim())
          .filter(Boolean);

        if (statements.length !== 1) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only a single query statement is allowed',
          });
        }

        const firstToken = statements[0].split(/\s+/)[0]?.toUpperCase();
        if (!firstToken || !ALLOWED_STATEMENT_PREFIXES.includes(firstToken)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `${firstToken ?? 'This'} statement type is not allowed in query editor`,
          });
        }

        const upperSanitized = sanitizedForAnalysis.toUpperCase();
        for (const keyword of DANGEROUS_KEYWORDS) {
          if (new RegExp(`\\b${keyword}\\b`).test(upperSanitized)) {
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
            const cached = await redis.get(cacheKey);
            if (cached) {
              log.debug({ cacheKey }, 'Query cache hit');
              return {
                success: true,
                data: cached.data,
                columns: cached.columns,
                rowCount: cached.rowCount,
                duration: Date.now() - startTime,
                cached: true,
              };
            }
          } catch (cacheError) {
            log.warn({ error: cacheError }, 'Cache read error');
          }
        }

        // 执行查询
        const result = await db.execute(sql.raw(input.sql));
        
        const data = result.rows || [];
        const columns = data.length > 0 ? Object.keys(data[0]) : [];

        // 保存到缓存
        if (input.useCache && redis && data.length > 0) {
          try {
            await redis.set(cacheKey, {
              data,
              columns,
              rowCount: data.length,
            }, { ex: CACHE_TTL });
            log.debug({ cacheKey, ttl: CACHE_TTL }, 'Query result cached');
          } catch (cacheError) {
            log.warn({ error: cacheError }, 'Cache write error');
          }
        }

        const duration = Date.now() - startTime;

        // 记录到历史
        // TODO: 保存到数据库的查询历史表

        log.info({
          userId: ctx.user.id,
          sql: input.sql,
          rowCount: data.length,
          duration,
        }, 'Query executed');

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

        log.error({
          userId: ctx.user.id,
          sql: input.sql,
          error: error.message,
          duration,
        }, 'Query execution failed');

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
      log.info({
        userId: ctx.user.id,
        sql: input.sql,
        name: input.name,
      }, 'Query saved to favorites');

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
      log.info({
        userId: ctx.user.id,
        favoriteId: input.id,
      }, 'Query removed from favorites');

      return { success: true };
    }),

  // 清除查询缓存
  clearCache: protectedProcedure
    .input(z.object({ pattern: z.string().optional() }))
    .mutation(async ({ input }) => {
      if (!redis) {
        return { success: false, message: 'Redis not configured' };
      }

      try {
        // 清除所有查询缓存
        const pattern = input.pattern || 'query:*';
        const keys = await redis.keys(pattern);
        
        if (keys.length > 0) {
          await redis.del(...keys);
          log.info({ pattern, count: keys.length }, 'Query cache cleared');
        }

        return {
          success: true,
          clearedCount: keys.length,
        };
      } catch (error: any) {
        log.error({ error: error.message }, 'Failed to clear cache');
        return {
          success: false,
          message: error.message,
        };
      }
    }),
});
