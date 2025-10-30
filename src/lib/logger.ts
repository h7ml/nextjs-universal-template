// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P0-LD-007] 实现结构化日志系统;
// 应用的原则: 可观测性, 安全日志脱敏;
// }}
import pino from 'pino';

// 敏感字段列表
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
  'cookie',
  'ssn',
  'creditCard',
];

// 创建日志实例
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  redact: {
    paths: SENSITIVE_FIELDS,
    remove: false,
    censor: '[REDACTED]',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      // 不记录完整headers，避免泄露敏感信息
      userAgent: req.headers?.['user-agent'],
      ip: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

/**
 * 创建带上下文的子日志器
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * 脱敏对象中的敏感字段
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object') {
      result[key] = sanitizeObject(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

export default logger;

// 导出快捷方法
export const log = {
  debug: (msg: string, ...args: any[]) => logger.debug(msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info(msg, ...args),
  warn: (msg: string, ...args: any[]) => logger.warn(msg, ...args),
  error: (msg: string | Error, ...args: any[]) => {
    if (msg instanceof Error) {
      logger.error({ err: msg }, msg.message, ...args);
    } else {
      logger.error(msg, ...args);
    }
  },
  fatal: (msg: string | Error, ...args: any[]) => {
    if (msg instanceof Error) {
      logger.fatal({ err: msg }, msg.message, ...args);
    } else {
      logger.fatal(msg, ...args);
    }
  },
};
