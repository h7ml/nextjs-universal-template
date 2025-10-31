// {{CHENGQI:
// 操作: 修改;
// 时间戳: 2025-10-30;
// 原因: [P3-LD-004] 扩展数据源管理功能;
// 应用的原则: API设计, 数据源抽象;
// }}
/**
 * Data source router
 */

import { dataSources } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router, protectedProcedure } from "../trpc";
import { DataSourceFactory } from "@/lib/datasource/factory";
import type { DataSourceConfig } from "@/lib/datasource";
import { log } from "@/lib/logger";
import { validateSqlIdentifier } from "@/lib/security";

function ensureValidIdentifier(value: string, field: string) {
  if (!validateSqlIdentifier(value)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${field} contains invalid characters`,
    });
  }
}

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
      
      // 关闭连接
      await DataSourceFactory.closeAdapter(input.id);
      
      return { success: true };
    }),

  // 测试连接
  testConnection: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const dataSource = await ctx.db.query.dataSources.findFirst({
        where: eq(dataSources.id, input.id),
      });

      if (!dataSource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data source not found",
        });
      }

      try {
        const config: DataSourceConfig = {
          id: dataSource.id,
          type: dataSource.type as any,
          name: dataSource.name,
          host: dataSource.config.host || 'localhost',
          port: dataSource.config.port || 5432,
          database: dataSource.config.database || '',
          username: dataSource.config.username,
          password: dataSource.config.password,
          ssl: dataSource.config.ssl || false,
          connectionOptions: dataSource.config.options,
        };

        const adapter = DataSourceFactory.createAdapter(config);
        const isConnected = await adapter.testConnection();
        await adapter.disconnect();

        return { success: isConnected };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }),

  // 获取Schemas
  getSchemas: protectedProcedure
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

      const config: DataSourceConfig = {
        id: dataSource.id,
        type: dataSource.type as any,
        name: dataSource.name,
        host: dataSource.config.host || 'localhost',
        port: dataSource.config.port || 5432,
        database: dataSource.config.database || '',
        username: dataSource.config.username,
        password: dataSource.config.password,
        ssl: dataSource.config.ssl || false,
        connectionOptions: dataSource.config.options,
      };

      const adapter = DataSourceFactory.createAdapter(config);
      try {
        const schemas = await adapter.getSchemas();
        return { schemas };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),

  // 获取表列表
  getTables: protectedProcedure
    .input(z.object({ id: z.string().uuid(), schema: z.string().optional() }))
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

      const config: DataSourceConfig = {
        id: dataSource.id,
        type: dataSource.type as any,
        name: dataSource.name,
        host: dataSource.config.host || 'localhost',
        port: dataSource.config.port || 5432,
        database: dataSource.config.database || '',
        username: dataSource.config.username,
        password: dataSource.config.password,
        ssl: dataSource.config.ssl || false,
        connectionOptions: dataSource.config.options,
      };

      const adapter = DataSourceFactory.createAdapter(config);
      try {
        const tables = await adapter.getTables(input.schema);
        return { tables };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),

  // 获取表结构
  getTableSchema: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        tableName: z.string(),
        schema: z.string().optional(),
      })
    )
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

      const config: DataSourceConfig = {
        id: dataSource.id,
        type: dataSource.type as any,
        name: dataSource.name,
        host: dataSource.config.host || 'localhost',
        port: dataSource.config.port || 5432,
        database: dataSource.config.database || '',
        username: dataSource.config.username,
        password: dataSource.config.password,
        ssl: dataSource.config.ssl || false,
        connectionOptions: dataSource.config.options,
      };

      const adapter = DataSourceFactory.createAdapter(config);
      try {
        const columns = await adapter.getTableSchema(input.tableName, input.schema);
        return { columns };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),

  // 预览表数据
  previewTable: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        tableName: z.string(),
        schema: z.string().optional(),
        limit: z.number().default(100),
      })
    )
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

      const config: DataSourceConfig = {
        id: dataSource.id,
        type: dataSource.type as any,
        name: dataSource.name,
        host: dataSource.config.host || 'localhost',
        port: dataSource.config.port || 5432,
        database: dataSource.config.database || '',
        username: dataSource.config.username,
        password: dataSource.config.password,
        ssl: dataSource.config.ssl || false,
        connectionOptions: dataSource.config.options,
      };

      const adapter = DataSourceFactory.createAdapter(config);
      try {
        let query: string;

        if (config.type === "mongodb") {
          ensureValidIdentifier(input.tableName, "tableName");
          if (input.schema) {
            ensureValidIdentifier(input.schema, "schema");
          }
          query = `db.${input.tableName}.find({}).limit(${input.limit})`;
        } else {
          ensureValidIdentifier(input.tableName, "tableName");
          if (input.schema) {
            ensureValidIdentifier(input.schema, "schema");
          }

          const quotedSchema = input.schema ? `"${input.schema}"` : null;
          const quotedTable = `"${input.tableName}"`;
          const qualifiedTable = quotedSchema
            ? `${quotedSchema}.${quotedTable}`
            : quotedTable;

          query = `SELECT * FROM ${qualifiedTable} LIMIT ${input.limit}`;
        }

        const result = await adapter.executeQuery(query);
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
    }),
});

