/**
 * Main tRPC router
 * {{CHENGQI:
 * 操作: 修改;
 * 时间戳: 2025-10-30;
 * 原因: 合并main分支 + [P0-LD-004] 添加权限管理路由;
 * 应用的原则: SOLID-O;
 * }}
 */

import { router } from "../trpc";
import { authRouter } from "./auth";
import { dashboardRouter } from "./dashboard";
import { dataSourceRouter } from "./data-source";
import { healthRouter } from "./health";
import { userRouter } from "./user";
import { permissionRouter } from "./permission";
import { auditLogRouter } from "./auditLog";
import { queryRouter } from "./query";

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  dashboard: dashboardRouter,
  dataSource: dataSourceRouter,
  permission: permissionRouter,
  auditLog: auditLogRouter,
  query: queryRouter,
});

export type AppRouter = typeof appRouter;
