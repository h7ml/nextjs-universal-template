/**
 * Database Schema
 * Table prefix: universal_
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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// User Roles
export const roles = pgTable("universal_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  permissions: json("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

// Relations
export const dashboardsRelations = relations(dashboards, ({ many }) => ({
  widgets: many(widgets),
}));

export const widgetsRelations = relations(widgets, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [widgets.dashboardId],
    references: [dashboards.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Dashboard = typeof dashboards.$inferSelect;
export type NewDashboard = typeof dashboards.$inferInsert;
export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;
export type DataSource = typeof dataSources.$inferSelect;
export type NewDataSource = typeof dataSources.$inferInsert;
