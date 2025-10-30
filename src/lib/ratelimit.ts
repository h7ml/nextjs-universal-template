// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P0-LD-004] 实现API速率限制;
// 应用的原则: 安全加固, 防止滥用;
// }}
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 创建Redis客户端
// 注意：需要设置环境变量 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN
// 如果未设置，将使用内存存储（仅用于开发）
let redis: Redis | undefined;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * 创建速率限制器
 * @param requests - 请求数
 * @param window - 时间窗口（如 "10 s", "1 m", "1 h"）
 */
export function createRateLimiter(requests: number, window: string) {
  if (!redis) {
    // 开发环境没有Redis时的警告
    console.warn(
      '⚠️  Rate limiting is using in-memory storage. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.'
    );

    return new Ratelimit({
      redis: Redis.fromEnv() as any,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: false,
    });
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: '@ratelimit',
  });
}

/**
 * 预定义的速率限制器
 */
export const rateLimiters = {
  // 严格限制（登录、注册等敏感操作）
  strict: createRateLimiter(5, '1 m'),

  // 标准限制（一般API）
  standard: createRateLimiter(20, '1 m'),

  // 宽松限制（公开API）
  relaxed: createRateLimiter(100, '1 m'),

  // 全局限制（按IP）
  global: createRateLimiter(1000, '1 h'),
};

/**
 * 检查速率限制
 * @param identifier - 标识符（通常是IP或用户ID）
 * @param limiter - 速率限制器
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = rateLimiters.standard
) {
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    return {
      success,
      limit,
      reset,
      remaining,
      retryAfter: success ? null : Math.ceil((reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // 失败时允许请求通过（fail open）
    return {
      success: true,
      limit: 0,
      reset: 0,
      remaining: 0,
      retryAfter: null,
    };
  }
}

/**
 * 从请求中获取客户端标识符
 */
export function getClientIdentifier(req: Request): string {
  // 优先使用 X-Forwarded-For (Vercel, Cloudflare等)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  // 其他常见的IP头
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Cloudflare
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * 速率限制响应
 */
export function createRateLimitResponse(result: Awaited<ReturnType<typeof checkRateLimit>>) {
  const headers = new Headers({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  });

  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(headers),
      },
    }
  );
}
