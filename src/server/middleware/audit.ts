/**
 * Audit Log Middleware
 * {{CHENGQI:
 * 操作: 新增;
 * 时间戳: 2025-10-30;
 * 原因: [P1-LD-007] 审计日志中间件实现;
 * 应用的原则: SOLID-S, 性能优化, 异步写入;
 * }}
 */

import type { Context } from "../context";
import { auditLogs, type NewAuditLog } from "@/db/schema";

export interface AuditLogOptions {
  action: string;
  module: string;
  target?: string;
  targetType?: string;
  before?: any;
  after?: any;
  status?: "success" | "failed";
  errorMessage?: string;
}

/**
 * Create an audit log entry
 * @param ctx - tRPC context
 * @param options - Audit log options
 * @param request - Optional request object for IP and User-Agent
 */
export async function createAuditLog(
  ctx: Context,
  options: AuditLogOptions,
  request?: Request
): Promise<void> {
  try {
    const logData: NewAuditLog = {
      userId: ctx.user?.id,
      action: options.action,
      module: options.module,
      target: options.target,
      targetType: options.targetType,
      status: options.status || "success",
      errorMessage: options.errorMessage,
      details: {
        before: options.before,
        after: options.after,
        ip: request ? getClientIP(request) : undefined,
        userAgent: request ? request.headers.get("user-agent") || undefined : undefined,
      },
    };

    // Async write to avoid blocking main operation
    // In production, consider using a queue system for better performance
    setImmediate(async () => {
      try {
        await ctx.db.insert(auditLogs).values(logData);
      } catch (error) {
        // Log error but don't throw to avoid breaking the main operation
        console.error("Failed to create audit log:", error);
      }
    });
  } catch (error) {
    console.error("Error in createAuditLog:", error);
  }
}

/**
 * Helper: Extract client IP from request
 */
function getClientIP(request: Request): string {
  // Try common headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to CF-Connecting-IP (Cloudflare)
  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP) {
    return cfIP;
  }

  return "unknown";
}

/**
 * Audit log middleware factory for tRPC
 * Automatically logs all mutations
 */
export function auditMiddleware(module: string) {
  return async ({ ctx, next, path, type }: {
    ctx: Context;
    next: () => any;
    path: string;
    type: string;
  }) => {
    // Only audit mutations (not queries)
    if (type !== "mutation") {
      return next();
    }

    const action = path.split(".").pop() || "unknown";
    const startTime = Date.now();

    try {
      const result = await next();
      const duration = Date.now() - startTime;

      // Log successful operation
      await createAuditLog(ctx, {
        action,
        module,
        target: result?.id || undefined,
        targetType: module,
        after: result,
        status: "success",
      });

      console.log(`[AUDIT] ${module}.${action} completed in ${duration}ms`);

      return result;
    } catch (error: any) {
      // Log failed operation
      await createAuditLog(ctx, {
        action,
        module,
        status: "failed",
        errorMessage: error.message || "Unknown error",
      });

      console.error(`[AUDIT] ${module}.${action} failed:`, error.message);

      throw error;
    }
  };
}

/**
 * Specific audit actions
 */
export const AuditActions = {
  // Auth
  LOGIN: "login",
  LOGOUT: "logout",
  REGISTER: "register",
  PASSWORD_CHANGE: "password_change",

  // CRUD
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  VIEW: "view",
  LIST: "list",

  // CMS
  PUBLISH: "publish",
  UNPUBLISH: "unpublish",
  ARCHIVE: "archive",

  // File
  UPLOAD: "upload",
  DOWNLOAD: "download",

  // Permission
  ASSIGN_PERMISSION: "assign_permission",
  REVOKE_PERMISSION: "revoke_permission",
  ASSIGN_ROLE: "assign_role",

  // System
  EXPORT: "export",
  IMPORT: "import",
  CONFIG_UPDATE: "config_update",
} as const;

/**
 * Audit modules
 */
export const AuditModules = {
  SYSTEM: "system",
  AUTH: "auth",
  USER: "user",
  ROLE: "role",
  PERMISSION: "permission",
  CMS_CONTENT: "cms_content",
  CMS_CATEGORY: "cms_category",
  FILE: "file",
  DASHBOARD: "dashboard",
  DEPARTMENT: "department",
  POSITION: "position",
  MENU: "menu",
  CONFIG: "config",
  NOTIFICATION: "notification",
} as const;
