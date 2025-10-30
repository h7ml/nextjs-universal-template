/**
 * Permission Management Router
 * {{CHENGQI:
 * 操作: 新增;
 * 时间戳: 2025-10-30;
 * 原因: [P0-LD-004] 权限管理API开发;
 * 应用的原则: SOLID, RESTful API设计;
 * }}
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, like, and, inArray } from "drizzle-orm";
import { router, adminProcedure, protectedProcedure } from "../trpc";
import { permissions, rolePermissions, roles } from "@/db/schema";
import { requirePermission } from "../middleware/permission";
import { PERMISSIONS, PermissionType } from "@/constants/permissions";

export const permissionRouter = router({
  /**
   * List all permissions with optional filtering
   */
  list: protectedProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_LIST))
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        module: z.string().optional(),
        type: z.nativeEnum(PermissionType).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.module) {
        conditions.push(eq(permissions.module, input.module));
      }

      if (input.type) {
        conditions.push(eq(permissions.type, input.type));
      }

      if (input.search) {
        conditions.push(
          like(permissions.name, `%${input.search}%`)
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [permissionList, total] = await Promise.all([
        ctx.db.query.permissions.findMany({
          where,
          limit: input.limit,
          offset: input.offset,
          orderBy: (permissions, { asc }) => [
            asc(permissions.module),
            asc(permissions.code),
          ],
        }),
        ctx.db
          .select({ count: permissions.id })
          .from(permissions)
          .where(where)
          .then((result) => result.length),
      ]);

      return {
        data: permissionList,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Get permission by ID
   */
  getById: protectedProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_LIST))
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const permission = await ctx.db.query.permissions.findFirst({
        where: eq(permissions.id, input.id),
      });

      if (!permission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permission not found",
        });
      }

      return permission;
    }),

  /**
   * Create a new permission
   */
  create: adminProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_CREATE))
    .input(
      z.object({
        code: z.string().min(3).max(100).regex(/^[a-z]+:[a-z:]+$/, {
          message: "Permission code must follow format: module:action (e.g., 'user:create')",
        }),
        name: z.string().min(1).max(100),
        module: z.string().min(1).max(50),
        description: z.string().optional(),
        type: z.nativeEnum(PermissionType).default(PermissionType.API),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if permission code already exists
      const existing = await ctx.db.query.permissions.findFirst({
        where: eq(permissions.code, input.code),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Permission with code '${input.code}' already exists`,
        });
      }

      const [newPermission] = await ctx.db
        .insert(permissions)
        .values(input)
        .returning();

      if (!newPermission) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create permission",
        });
      }

      return newPermission;
    }),

  /**
   * Update permission
   */
  update: adminProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_UPDATE))
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        type: z.nativeEnum(PermissionType).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const [updated] = await ctx.db
        .update(permissions)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(permissions.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permission not found",
        });
      }

      return updated;
    }),

  /**
   * Delete permission
   */
  delete: adminProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_DELETE))
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if permission is in use
      const inUse = await ctx.db.query.rolePermissions.findFirst({
        where: eq(rolePermissions.permissionId, input.id),
      });

      if (inUse) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete permission that is assigned to roles",
        });
      }

      await ctx.db.delete(permissions).where(eq(permissions.id, input.id));

      return { success: true };
    }),

  /**
   * Get permissions for a specific role
   */
  getByRole: protectedProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_LIST))
    .input(z.object({ roleId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rolePerms = await ctx.db
        .select({
          id: permissions.id,
          code: permissions.code,
          name: permissions.name,
          module: permissions.module,
          description: permissions.description,
          type: permissions.type,
        })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id)
        )
        .where(eq(rolePermissions.roleId, input.roleId));

      return rolePerms;
    }),

  /**
   * Assign permissions to a role
   */
  assignToRole: adminProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_ASSIGN))
    .input(
      z.object({
        roleId: z.string().uuid(),
        permissionIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if role exists
      const role = await ctx.db.query.roles.findFirst({
        where: eq(roles.id, input.roleId),
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Role not found",
        });
      }

      // Remove existing permissions for this role
      await ctx.db
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, input.roleId));

      // Add new permissions
      if (input.permissionIds.length > 0) {
        await ctx.db.insert(rolePermissions).values(
          input.permissionIds.map((permissionId) => ({
            roleId: input.roleId,
            permissionId,
          }))
        );
      }

      return { success: true, count: input.permissionIds.length };
    }),

  /**
   * Remove permission from a role
   */
  removeFromRole: adminProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_ASSIGN))
    .input(
      z.object({
        roleId: z.string().uuid(),
        permissionId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, input.roleId),
            eq(rolePermissions.permissionId, input.permissionId)
          )
        );

      return { success: true };
    }),

  /**
   * Get all available modules
   */
  getModules: protectedProcedure
    .use(requirePermission(PERMISSIONS.PERMISSION_LIST))
    .query(async ({ ctx }) => {
      const modules = await ctx.db
        .selectDistinct({ module: permissions.module })
        .from(permissions)
        .orderBy(permissions.module);

      return modules.map((m) => m.module);
    }),

  /**
   * Get current user's permissions
   */
  getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || !ctx.user.roleId) {
      return [];
    }

    const userPerms = await ctx.db
      .select({
        id: permissions.id,
        code: permissions.code,
        name: permissions.name,
        module: permissions.module,
        type: permissions.type,
      })
      .from(rolePermissions)
      .innerJoin(
        permissions,
        eq(rolePermissions.permissionId, permissions.id)
      )
      .where(eq(rolePermissions.roleId, ctx.user.roleId));

    return userPerms;
  }),
});
