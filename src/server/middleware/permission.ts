/**
 * Permission Middleware for tRPC
 * {{CHENGQI:
 * 操作: 新增;
 * 时间戳: 2025-10-30;
 * 原因: [P0-LD-003] 权限验证中间件实现;
 * 应用的原则: SOLID-S, DRY, 安全编码;
 * }}
 */

import { TRPCError } from "@trpc/server";
import type { Context } from "../context";
import { permissions, rolePermissions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * Check if user has a specific permission
 * @param ctx - tRPC context with authenticated user
 * @param permissionCode - Permission code to check (e.g., 'user:create')
 * @returns Promise<boolean> - True if user has permission
 */
export async function hasPermission(
  ctx: Context,
  permissionCode: string
): Promise<boolean> {
  // Check if user is authenticated
  if (!ctx.user || !ctx.user.roleId) {
    return false;
  }

  try {
    // Get all permissions for the user's role
    const rolePerms = await ctx.db
      .select({
        code: permissions.code,
      })
      .from(rolePermissions)
      .innerJoin(
        permissions,
        eq(rolePermissions.permissionId, permissions.id)
      )
      .where(eq(rolePermissions.roleId, ctx.user.roleId));

    // Check if the permission code exists in user's permissions
    return rolePerms.some((perm) => perm.code === permissionCode);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Check if user has any of the specified permissions
 * @param ctx - tRPC context
 * @param permissionCodes - Array of permission codes
 * @returns Promise<boolean> - True if user has at least one permission
 */
export async function hasAnyPermission(
  ctx: Context,
  permissionCodes: string[]
): Promise<boolean> {
  if (!ctx.user || !ctx.user.roleId) {
    return false;
  }

  try {
    const rolePerms = await ctx.db
      .select({
        code: permissions.code,
      })
      .from(rolePermissions)
      .innerJoin(
        permissions,
        eq(rolePermissions.permissionId, permissions.id)
      )
      .where(eq(rolePermissions.roleId, ctx.user.roleId));

    return rolePerms.some((perm) => permissionCodes.includes(perm.code));
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}

/**
 * Check if user has all of the specified permissions
 * @param ctx - tRPC context
 * @param permissionCodes - Array of permission codes
 * @returns Promise<boolean> - True if user has all permissions
 */
export async function hasAllPermissions(
  ctx: Context,
  permissionCodes: string[]
): Promise<boolean> {
  if (!ctx.user || !ctx.user.roleId) {
    return false;
  }

  try {
    const rolePerms = await ctx.db
      .select({
        code: permissions.code,
      })
      .from(rolePermissions)
      .innerJoin(
        permissions,
        eq(rolePermissions.permissionId, permissions.id)
      )
      .where(eq(rolePermissions.roleId, ctx.user.roleId));

    const userPermCodes = rolePerms.map((perm) => perm.code);
    return permissionCodes.every((code) => userPermCodes.includes(code));
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * @param ctx - tRPC context
 * @returns Promise<string[]> - Array of permission codes
 */
export async function getUserPermissions(ctx: Context): Promise<string[]> {
  if (!ctx.user || !ctx.user.roleId) {
    return [];
  }

  try {
    const rolePerms = await ctx.db
      .select({
        code: permissions.code,
      })
      .from(rolePermissions)
      .innerJoin(
        permissions,
        eq(rolePermissions.permissionId, permissions.id)
      )
      .where(eq(rolePermissions.roleId, ctx.user.roleId));

    return rolePerms.map((perm) => perm.code);
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}

/**
 * Middleware factory: Create a permission check middleware
 * @param permissionCode - Required permission code
 * @returns Middleware function that throws TRPCError if user lacks permission
 * 
 * @example
 * ```typescript
 * const createUserProcedure = protectedProcedure
 *   .use(requirePermission('user:create'))
 *   .mutation(async ({ ctx, input }) => {
 *     // User has 'user:create' permission
 *   });
 * ```
 */
export function requirePermission(permissionCode: string) {
  return async ({ ctx, next }: { ctx: Context; next: () => any }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const allowed = await hasPermission(ctx, permissionCode);

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission denied: ${permissionCode} required`,
      });
    }

    return next();
  };
}

/**
 * Middleware factory: Require any of the specified permissions
 * @param permissionCodes - Array of permission codes (OR logic)
 */
export function requireAnyPermission(permissionCodes: string[]) {
  return async ({ ctx, next }: { ctx: Context; next: () => any }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const allowed = await hasAnyPermission(ctx, permissionCodes);

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission denied: One of [${permissionCodes.join(", ")}] required`,
      });
    }

    return next();
  };
}

/**
 * Middleware factory: Require all of the specified permissions
 * @param permissionCodes - Array of permission codes (AND logic)
 */
export function requireAllPermissions(permissionCodes: string[]) {
  return async ({ ctx, next }: { ctx: Context; next: () => any }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const allowed = await hasAllPermissions(ctx, permissionCodes);

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission denied: All of [${permissionCodes.join(", ")}] required`,
      });
    }

    return next();
  };
}
