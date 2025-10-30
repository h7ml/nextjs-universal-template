/**
 * Audit Log Router
 * {{CHENGQI:
 * 操作: 新增;
 * 时间戳: 2025-10-30;
 * 原因: [P1-LD-008] 审计日志查询API;
 * 应用的原则: SOLID, 权限控制;
 * }}
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte, like, desc } from "drizzle-orm";
import { router, adminProcedure, protectedProcedure } from "../trpc";
import { auditLogs, users } from "@/db/schema";
import { requirePermission } from "../middleware/permission";
import { PERMISSIONS } from "@/constants/permissions";

export const auditLogRouter = router({
  /**
   * List audit logs with filtering and pagination
   */
  list: adminProcedure
    .use(requirePermission(PERMISSIONS.AUDIT_LIST))
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        userId: z.string().uuid().optional(),
        module: z.string().optional(),
        action: z.string().optional(),
        status: z.enum(["success", "failed"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        search: z.string().optional(), // Search in target or details
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.userId) {
        conditions.push(eq(auditLogs.userId, input.userId));
      }

      if (input.module) {
        conditions.push(eq(auditLogs.module, input.module));
      }

      if (input.action) {
        conditions.push(eq(auditLogs.action, input.action));
      }

      if (input.status) {
        conditions.push(eq(auditLogs.status, input.status));
      }

      if (input.startDate) {
        conditions.push(gte(auditLogs.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(auditLogs.createdAt, input.endDate));
      }

      if (input.search) {
        conditions.push(
          like(auditLogs.target, `%${input.search}%`)
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [logs, total] = await Promise.all([
        ctx.db
          .select({
            id: auditLogs.id,
            userId: auditLogs.userId,
            userName: users.name,
            userEmail: users.email,
            action: auditLogs.action,
            module: auditLogs.module,
            target: auditLogs.target,
            targetType: auditLogs.targetType,
            details: auditLogs.details,
            status: auditLogs.status,
            errorMessage: auditLogs.errorMessage,
            createdAt: auditLogs.createdAt,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .where(where)
          .orderBy(desc(auditLogs.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ count: auditLogs.id })
          .from(auditLogs)
          .where(where)
          .then((result) => result.length),
      ]);

      return {
        data: logs,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Get audit log by ID
   */
  getById: adminProcedure
    .use(requirePermission(PERMISSIONS.AUDIT_VIEW))
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const log = await ctx.db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          userName: users.name,
          userEmail: users.email,
          action: auditLogs.action,
          module: auditLogs.module,
          target: auditLogs.target,
          targetType: auditLogs.targetType,
          details: auditLogs.details,
          status: auditLogs.status,
          errorMessage: auditLogs.errorMessage,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(eq(auditLogs.id, input.id))
        .limit(1);

      if (!log || log.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Audit log not found",
        });
      }

      return log[0];
    }),

  /**
   * Get audit logs for a specific user
   */
  getByUser: adminProcedure
    .use(requirePermission(PERMISSIONS.AUDIT_LIST))
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.query.auditLogs.findMany({
        where: eq(auditLogs.userId, input.userId),
        limit: input.limit,
        offset: input.offset,
        orderBy: desc(auditLogs.createdAt),
      });

      return logs;
    }),

  /**
   * Get audit logs for a specific target (resource)
   */
  getByTarget: adminProcedure
    .use(requirePermission(PERMISSIONS.AUDIT_VIEW))
    .input(
      z.object({
        target: z.string(),
        targetType: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          userName: users.name,
          action: auditLogs.action,
          module: auditLogs.module,
          details: auditLogs.details,
          status: auditLogs.status,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(
          and(
            eq(auditLogs.target, input.target),
            eq(auditLogs.targetType, input.targetType)
          )
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(input.limit);

      return logs;
    }),

  /**
   * Get statistics about audit logs
   */
  getStats: adminProcedure
    .use(requirePermission(PERMISSIONS.AUDIT_LIST))
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.startDate) {
        conditions.push(gte(auditLogs.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(auditLogs.createdAt, input.endDate));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const total = await ctx.db
        .select({ count: auditLogs.id })
        .from(auditLogs)
        .where(where)
        .then((result) => result.length);

      // Get success/failed counts
      const successCount = await ctx.db
        .select({ count: auditLogs.id })
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.status, "success"),
            where
          )
        )
        .then((result) => result.length);

      const failedCount = total - successCount;

      // Get most active modules
      const moduleStats = await ctx.db
        .select({
          module: auditLogs.module,
          count: auditLogs.id,
        })
        .from(auditLogs)
        .where(where)
        .groupBy(auditLogs.module)
        .orderBy(desc(auditLogs.id))
        .limit(10);

      // Get most active users
      const userStats = await ctx.db
        .select({
          userId: auditLogs.userId,
          userName: users.name,
          count: auditLogs.id,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(where)
        .groupBy(auditLogs.userId, users.name)
        .orderBy(desc(auditLogs.id))
        .limit(10);

      return {
        total,
        successCount,
        failedCount,
        successRate: total > 0 ? (successCount / total) * 100 : 0,
        moduleStats,
        userStats,
      };
    }),

  /**
   * Get available modules (for filtering)
   */
  getModules: adminProcedure
    .use(requirePermission(PERMISSIONS.AUDIT_LIST))
    .query(async ({ ctx }) => {
      const modules = await ctx.db
        .selectDistinct({ module: auditLogs.module })
        .from(auditLogs)
        .orderBy(auditLogs.module);

      return modules.map((m) => m.module);
    }),

  /**
   * Get available actions (for filtering)
   */
  getActions: adminProcedure
    .use(requirePermission(PERMISSIONS.AUDIT_LIST))
    .query(async ({ ctx }) => {
      const actions = await ctx.db
        .selectDistinct({ action: auditLogs.action })
        .from(auditLogs)
        .orderBy(auditLogs.action);

      return actions.map((a) => a.action);
    }),

  /**
   * Export audit logs (returns data for CSV export)
   */
  export: adminProcedure
    .use(requirePermission(PERMISSIONS.AUDIT_EXPORT))
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        module: z.string().optional(),
        status: z.enum(["success", "failed"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.startDate) {
        conditions.push(gte(auditLogs.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(auditLogs.createdAt, input.endDate));
      }

      if (input.module) {
        conditions.push(eq(auditLogs.module, input.module));
      }

      if (input.status) {
        conditions.push(eq(auditLogs.status, input.status));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const logs = await ctx.db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          userEmail: users.email,
          action: auditLogs.action,
          module: auditLogs.module,
          target: auditLogs.target,
          targetType: auditLogs.targetType,
          status: auditLogs.status,
          errorMessage: auditLogs.errorMessage,
          createdAt: auditLogs.createdAt,
          ip: auditLogs.details,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(10000); // Limit for safety

      // Transform for CSV export
      return logs.map((log) => ({
        id: log.id,
        userId: log.userId || "N/A",
        userEmail: log.userEmail || "N/A",
        action: log.action,
        module: log.module,
        target: log.target || "N/A",
        targetType: log.targetType || "N/A",
        status: log.status,
        errorMessage: log.errorMessage || "",
        ip: log.ip && typeof log.ip === "object" && "ip" in log.ip ? (log.ip as any).ip : "N/A",
        createdAt: log.createdAt.toISOString(),
      }));
    }),
});
