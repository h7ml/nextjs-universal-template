/**
 * Main tRPC router
 */

import { router } from "../trpc";
import { authRouter } from "./auth";
import { dashboardRouter } from "./dashboard";
import { dataSourceRouter } from "./data-source";
import { healthRouter } from "./health";
import { userRouter } from "./user";

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  dashboard: dashboardRouter,
  dataSource: dataSourceRouter,
});

export type AppRouter = typeof appRouter;
