/**
 * Database Schema
 * Table prefix: universal_
 * {{CHENGQI:
 * 操作: 新增;
 * 时间戳: 2025-10-30;
 * 原因: [P0-AR-002] 数据库Schema扩展 - 权限系统;
 * 应用的原则: SOLID-S, 数据库设计范式;
 * }}
 */

import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  json,
  varchar,
  integer,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// {{开始修改}}
// Permissions
export const permissions = pgTable("universal_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 100 }).notNull().unique(), // e.g., 'user:create', 'cms:publish'
  name: varchar("name", { length: 100 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(), // e.g., 'user', 'cms', 'file'
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull().default("api"), // 'menu', 'button', 'api'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Roles
export const roles = pgTable("universal_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  permissions: json("permissions").$type<string[]>().default([]), // Deprecated: 保留向后兼容
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Role-Permission Association (Many-to-Many)
export const rolePermissions = pgTable(
  "universal_role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
);
// {{结束修改}}

// Users
export const users = pgTable("universal_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(), // hashed
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  roleId: uuid("role_id").references(() => roles.id),
  isActive: boolean("is_active").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions (JWT alternative for server-side session management)
export const sessions = pgTable("universal_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dashboards
export const dashboards = pgTable("universal_dashboards", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  config: json("config").$type<Record<string, any>>().default({}),
  createdBy: uuid("created_by").references(() => users.id),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dashboardShares = pgTable(
  "universal_dashboard_shares",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dashboardId: uuid("dashboard_id")
      .notNull()
      .references(() => dashboards.id, { onDelete: "cascade" }),
    shareId: varchar("share_id", { length: 64 }).notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    allowEmbed: boolean("allow_embed").notNull().default(true),
    requirePassword: boolean("require_password").notNull().default(false),
    passwordHash: text("password_hash"),
    expiresAt: timestamp("expires_at"),
    viewCount: integer("view_count").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    shareIdIdx: uniqueIndex("universal_dashboard_shares_share_id_idx").on(
      table.shareId
    ),
  })
);

// Chart Widgets
export const widgets = pgTable("universal_widgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  dashboardId: uuid("dashboard_id")
    .references(() => dashboards.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // line, bar, pie, etc.
  title: varchar("title", { length: 255 }).notNull(),
  config: json("config").$type<Record<string, any>>().default({}),
  position: json("position").$type<{
    x: number;
    y: number;
    w: number;
    h: number;
  }>(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Data Sources (for widgets)
export const dataSources = pgTable("universal_data_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // api, static, query
  config: json("config").$type<Record<string, any>>().default({}),
  data: json("data").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// {{开始修改 - P1-AR-006}}
// Audit Logs
export const auditLogs = pgTable("universal_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // null if user deleted
  action: varchar("action", { length: 50 }).notNull(), // 'create', 'update', 'delete', 'login', etc.
  module: varchar("module", { length: 50 }).notNull(), // 'user', 'cms', 'file', etc.
  target: varchar("target", { length: 255 }), // ID of the affected resource
  targetType: varchar("target_type", { length: 50 }), // Type of the affected resource
  details: json("details").$type<{
    before?: any;
    after?: any;
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  }>(),
  status: varchar("status", { length: 20 }).notNull().default("success"), // 'success', 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// {{结束修改}}

// Relations
export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ many }) => ({
  widgets: many(widgets),
  shares: many(dashboardShares),
}));

export const widgetsRelations = relations(widgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [widgets.dashboardId],
    references: [dashboards.id],
  }),
}));

export const dashboardSharesRelations = relations(dashboardShares, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [dashboardShares.dashboardId],
    references: [dashboards.id],
  }),
  owner: one(users, {
    fields: [dashboardShares.createdBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Types
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Dashboard = typeof dashboards.$inferSelect;
export type NewDashboard = typeof dashboards.$inferInsert;
export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;
export type DataSource = typeof dataSources.$inferSelect;
export type NewDataSource = typeof dataSources.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type DashboardShare = typeof dashboardShares.$inferSelect;
export type NewDashboardShare = typeof dashboardShares.$inferInsert;
