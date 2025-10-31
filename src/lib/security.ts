// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P0-LD-006] 实现输入清洗和XSS防护;
// 应用的原则: 安全编码, Defense in Depth;
// }}
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * 清洗HTML，防止XSS攻击
 */
export function sanitizeHtml(dirty: string, options?: DOMPurify.Config): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ...options,
  });
}

/**
 * 清洗纯文本，移除所有HTML标签
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Zod schema：清洗后的字符串
 */
export const sanitizedString = z.string().transform((val) => sanitizeText(val));

/**
 * Zod schema：清洗后的HTML
 */
export const sanitizedHtml = z.string().transform((val) => sanitizeHtml(val));

/**
 * 验证并清洗邮箱
 */
export const sanitizedEmail = z
  .string()
  .email()
  .transform((val) => val.toLowerCase().trim());

/**
 * 验证URL并防止JavaScript伪协议
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // 只允许http和https协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Zod schema：安全的URL
 */
export const safeUrl = z.string().transform((val) => {
  const sanitized = sanitizeUrl(val);
  if (!sanitized) {
    throw new z.ZodError([
      {
        code: 'custom',
        message: 'Invalid or unsafe URL',
        path: [],
      },
    ]);
  }
  return sanitized;
});

/**
 * 生成随机token（用于CSRF等）
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    throw new Error('Secure random generator is not available in this environment');
  }

  return Buffer.from(array).toString('base64url');
}

/**
 * 常量时间字符串比较（防止时序攻击）
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * 验证CSRF Token
 */
export function verifyCsrfToken(token: string | null, sessionToken: string): boolean {
  if (!token) return false;
  return constantTimeCompare(token, sessionToken);
}

/**
 * SQL注入防护提示（Drizzle ORM已提供保护，这里是额外提醒）
 */
export function validateSqlIdentifier(identifier: string): boolean {
  // 只允许字母、数字和下划线
  return /^[a-zA-Z0-9_]+$/.test(identifier);
}

/**
 * 清洗对象中的所有字符串字段
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: any = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'string') {
      result[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = Array.isArray(value)
        ? value.map((item) => (typeof item === 'string' ? sanitizeText(item) : item))
        : sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
