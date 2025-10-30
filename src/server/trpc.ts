/**
 * tRPC initialization
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now guaranteed to be defined
    },
  });
});

// Admin procedure (requires admin role)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Check if user has admin role
  // For now, you can implement role-based logic here
  // Example: Check user.roleId against admin role ID
  const isAdmin = ctx.user?.roleId !== undefined; // Placeholder - implement actual role check

  if (!isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});
