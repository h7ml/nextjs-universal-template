// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P0-LD-004] tRPC速率限制中间件;
// 应用的原则: 安全加固, API保护;
// }}
import { TRPCError } from '@trpc/server';
import { middleware } from '../trpc';
import { checkRateLimit, rateLimiters, type Ratelimit } from '@/lib/ratelimit';

/**
 * 创建速率限制中间件
 * @param limiter - 速率限制器（可选，默认使用standard）
 */
export function createRateLimitMiddleware(limiter?: Ratelimit) {
  return middleware(async ({ ctx, next }) => {
    // 获取标识符（优先用户ID，否则用IP）
    const identifier = ctx.user?.id || ctx.ip || 'anonymous';

    // 检查速率限制
    const result = await checkRateLimit(identifier, limiter);

    if (!result.success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      });
    }

    // 将速率限制信息添加到上下文
    return next({
      ctx: {
        ...ctx,
        rateLimit: {
          remaining: result.remaining,
          limit: result.limit,
          reset: result.reset,
        },
      },
    });
  });
}

/**
 * 预定义的速率限制中间件
 */
export const rateLimitMiddleware = {
  // 严格限制
  strict: createRateLimitMiddleware(rateLimiters.strict),

  // 标准限制
  standard: createRateLimitMiddleware(rateLimiters.standard),

  // 宽松限制
  relaxed: createRateLimitMiddleware(rateLimiters.relaxed),
};

// 导出默认的标准限制
export default rateLimitMiddleware.standard;
