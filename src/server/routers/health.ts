/**
 * Health check router
 */

import { getPlatformInfo } from "@/lib/platform";
import { publicProcedure, router } from "../trpc";

export const healthRouter = router({
  check: publicProcedure.query(async () => {
    const platformInfo = getPlatformInfo();

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      platform: platformInfo.platform,
      runtime: platformInfo.runtime,
      environment: platformInfo.isProduction ? "production" : "development",
    };
  }),
});
