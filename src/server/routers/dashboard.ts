/**
 * Dashboard router
 */

import { dashboards, widgets } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const dashboardRouter = router({
  // List dashboards
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const list = await ctx.db.query.dashboards.findMany({
        where: (dashboards, { or, eq }) =>
          or(
            eq(dashboards.createdBy, ctx.user.id),
            eq(dashboards.isPublic, true)
          ),
        limit: input.limit,
        offset: input.offset,
        orderBy: (dashboards, { desc }) => [desc(dashboards.createdAt)],
      });

      return list;
    }),

  // Get dashboard by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const dashboard = await ctx.db.query.dashboards.findFirst({
        where: eq(dashboards.id, input.id),
        with: {
          widgets: true,
        },
      });

      if (!dashboard) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dashboard not found",
        });
      }

      // Check access
      if (!dashboard.isPublic && dashboard.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return dashboard;
    }),

  // Create dashboard
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        config: z.record(z.any()).optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [dashboard] = await ctx.db
        .insert(dashboards)
        .values({
          ...input,
          createdBy: ctx.user.id,
        })
        .returning();

      return dashboard;
    }),

  // Update dashboard
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        config: z.record(z.any()).optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check ownership
      const dashboard = await ctx.db.query.dashboards.findFirst({
        where: eq(dashboards.id, id),
      });

      if (!dashboard) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dashboard not found",
        });
      }

      if (dashboard.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const [updated] = await ctx.db
        .update(dashboards)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(dashboards.id, id))
        .returning();

      return updated;
    }),

  // Delete dashboard
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const dashboard = await ctx.db.query.dashboards.findFirst({
        where: eq(dashboards.id, input.id),
      });

      if (!dashboard) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dashboard not found",
        });
      }

      if (dashboard.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      await ctx.db.delete(dashboards).where(eq(dashboards.id, input.id));
      return { success: true };
    }),

  // Widget operations
  widget: router({
    // Add widget to dashboard
    create: protectedProcedure
      .input(
        z.object({
          dashboardId: z.string().uuid(),
          type: z.string(),
          title: z.string(),
          config: z.record(z.any()).optional(),
          position: z
            .object({
              x: z.number(),
              y: z.number(),
              w: z.number(),
              h: z.number(),
            })
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check dashboard ownership
        const dashboard = await ctx.db.query.dashboards.findFirst({
          where: eq(dashboards.id, input.dashboardId),
        });

        if (!dashboard || dashboard.createdBy !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        const [widget] = await ctx.db.insert(widgets).values(input).returning();

        return widget;
      }),

    // Update widget
    update: protectedProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          title: z.string().optional(),
          config: z.record(z.any()).optional(),
          position: z
            .object({
              x: z.number(),
              y: z.number(),
              w: z.number(),
              h: z.number(),
            })
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        const [updated] = await ctx.db
          .update(widgets)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(widgets.id, id))
          .returning();

        return updated;
      }),

    // Delete widget
    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db.delete(widgets).where(eq(widgets.id, input.id));
        return { success: true };
      }),
  }),
});
