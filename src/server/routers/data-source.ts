/**
 * Data source router
 */

import { dataSources } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../trpc";

const listInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
});

const baseDataSourceSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(50),
  config: z.record(z.any()).default({}),
  data: z.any().optional(),
});

export const dataSourceRouter = router({
  list: adminProcedure
    .input(listInputSchema.optional())
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0, search } = input ?? {};

      const list = await ctx.db.query.dataSources.findMany({
        where: search
          ? (dataSources, { ilike }) =>
              ilike(dataSources.name, `%${search}%`)
          : undefined,
        limit,
        offset,
        orderBy: (dataSources, { desc }) => [desc(dataSources.createdAt)],
      });

      return list;
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const dataSource = await ctx.db.query.dataSources.findFirst({
        where: eq(dataSources.id, input.id),
      });

      if (!dataSource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data source not found",
        });
      }

      return dataSource;
    }),

  create: adminProcedure
    .input(baseDataSourceSchema)
    .mutation(async ({ ctx, input }) => {
      const payload = {
        ...input,
        name: input.name.trim(),
        type: input.type.trim(),
      };

      const [created] = await ctx.db.insert(dataSources).values(payload).returning();
      return created;
    }),

  update: adminProcedure
    .input(
      baseDataSourceSchema.partial().extend({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.query.dataSources.findFirst({
        where: eq(dataSources.id, id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data source not found",
        });
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }
      if (data.type !== undefined) {
        updateData.type = data.type.trim();
      }
      if (data.config !== undefined) {
        updateData.config = data.config;
      }
      if (data.data !== undefined) {
        updateData.data = data.data;
      }

      const [updated] = await ctx.db
        .update(dataSources)
        .set(updateData)
        .where(eq(dataSources.id, id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.dataSources.findFirst({
        where: eq(dataSources.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data source not found",
        });
      }

      await ctx.db.delete(dataSources).where(eq(dataSources.id, input.id));
      return { success: true };
    }),
});

