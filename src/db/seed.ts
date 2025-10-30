/**
 * Database Seed Script
 * Run with: npm run db:seed or tsx src/db/seed.ts
 */

// Load environment variables from .env.local FIRST, before any other imports
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Try to load .env.local first, then .env
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  const result = config({ path: envLocalPath });
  if (result.error) {
    console.warn("⚠️  Error loading .env.local:", result.error.message);
  } else {
    console.log("✅ Loaded .env.local");
  }
} else if (existsSync(envPath)) {
  const result = config({ path: envPath });
  if (result.error) {
    console.warn("⚠️  Error loading .env:", result.error.message);
  } else {
    console.log("✅ Loaded .env");
  }
} else {
  console.warn("⚠️  No .env.local or .env file found");
}

// Check if DATABASE_URL is set
// Clean up any quotes from the value
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    /^["']|["']$/g,
    ""
  );
}

if (!process.env.DATABASE_URL) {
  console.error("\n❌ ERROR: DATABASE_URL environment variable is not set!");
  console.error("\n请确保：");
  console.error("1. .env.local 文件存在于项目根目录");
  console.error("2. .env.local 中包含 DATABASE_URL=postgresql://...");
  console.error("   (注意：不要使用引号包裹整个值)");
  console.error("\n示例：");
  console.error("DATABASE_URL=postgresql://user:password@host:5432/database");
  console.error("\n提示：运行 pnpm db:push 来创建数据库表");
  process.exit(1);
}

console.log("✅ DATABASE_URL is set");

// Create database connection directly to avoid import-time execution issues
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Import schema types
const { roles, users, dashboards, widgets, dataSources } = schema;

// {{开始修改}}
// Use bcrypt for password hashing (same as auth router)
import bcrypt from "bcryptjs";

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
// {{结束修改}}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Try to clear existing data, but handle case where tables don't exist
    console.log("🧹 Cleaning existing data...");
    try {
      await db.delete(widgets);
      await db.delete(dataSources);
      await db.delete(dashboards);
      await db.delete(users);
      await db.delete(roles);
      console.log("✅ Existing data cleaned");
    } catch (error: any) {
      // If tables don't exist, we need to create them first
      if (
        error?.cause?.code === "42P01" ||
        error?.message?.includes("does not exist")
      ) {
        console.warn(
          "⚠️  Tables do not exist yet. Please run migrations first:"
        );
        console.warn("   pnpm db:push");
        console.warn("\n或者运行以下命令创建表：");
        console.warn("   pnpm db:generate");
        console.warn("   pnpm db:push");
        throw new Error(
          "Database tables do not exist. Please run migrations first."
        );
      }
      throw error;
    }

    // 1. Create Roles
    console.log("📝 Creating roles...");
    const [adminRole] = await db
      .insert(roles)
      .values({
        name: "admin",
        description: "Administrator with full access",
        permissions: ["read", "write", "delete", "admin"],
      })
      .returning();

    const [userRole] = await db
      .insert(roles)
      .values({
        name: "user",
        description: "Regular user with limited access",
        permissions: ["read", "write"],
      })
      .returning();

    if (!adminRole || !userRole) {
      throw new Error("Failed to create roles");
    }

    console.log("✅ Roles created:", {
      adminRole: adminRole.name,
      userRole: userRole.name,
    });

    // 2. Create Users
    console.log("👤 Creating users...");
    const [adminUser] = await db
      .insert(users)
      .values({
        email: "admin@example.com",
        username: "admin",
        password: await hashPassword("admin123"),
        name: "Administrator",
        roleId: adminRole.id,
        isActive: true,
        emailVerified: true,
      })
      .returning();

    if (!adminUser) {
      throw new Error("Failed to create admin user");
    }

    const [testUser] = await db
      .insert(users)
      .values({
        email: "user@example.com",
        username: "testuser",
        password: await hashPassword("user123"),
        name: "Test User",
        roleId: userRole.id,
        isActive: true,
        emailVerified: true,
      })
      .returning();

    if (!testUser) {
      throw new Error("Failed to create test user");
    }

    const [demoUser] = await db
      .insert(users)
      .values({
        email: "demo@example.com",
        username: "demo",
        password: await hashPassword("demo123"),
        name: "Demo User",
        roleId: userRole.id,
        isActive: true,
        emailVerified: false,
      })
      .returning();

    if (!demoUser) {
      throw new Error("Failed to create demo user");
    }

    console.log("✅ Users created:", {
      admin: adminUser.email,
      user: testUser.email,
      demo: demoUser.email,
    });

    // 3. Create Data Sources
    console.log("📊 Creating data sources...");
    const [salesDataSource] = await db
      .insert(dataSources)
      .values({
        name: "Sales Data",
        type: "static",
        config: { frequency: "daily" },
        data: {
          months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          sales: [400, 300, 200, 278, 189, 239],
          revenue: [2400, 1398, 9800, 3908, 4800, 3800],
        },
      })
      .returning();

    if (!salesDataSource) {
      throw new Error("Failed to create sales data source");
    }

    const [userGrowthDataSource] = await db
      .insert(dataSources)
      .values({
        name: "User Growth",
        type: "static",
        config: { frequency: "daily" },
        data: {
          dates: ["2024-01", "2024-02", "2024-03", "2024-04"],
          users: [100, 150, 200, 250],
          newUsers: [10, 15, 20, 25],
        },
      })
      .returning();

    if (!userGrowthDataSource) {
      throw new Error("Failed to create user growth data source");
    }

    const [deviceDataSource] = await db
      .insert(dataSources)
      .values({
        name: "Device Distribution",
        type: "static",
        config: {},
        data: {
          devices: [
            { name: "Desktop", value: 400 },
            { name: "Mobile", value: 300 },
            { name: "Tablet", value: 200 },
            { name: "Other", value: 100 },
          ],
        },
      })
      .returning();

    if (!deviceDataSource) {
      throw new Error("Failed to create device data source");
    }

    console.log("✅ Data sources created");

    // 4. Create Dashboards
    console.log("📈 Creating dashboards...");
    const [salesDashboard] = await db
      .insert(dashboards)
      .values({
        name: "销售分析看板",
        description: "销售数据和趋势分析",
        config: {
          layout: "grid",
          theme: "light",
        },
        createdBy: adminUser.id,
        isPublic: true,
      })
      .returning();

    if (!salesDashboard) {
      throw new Error("Failed to create sales dashboard");
    }

    const [userDashboard] = await db
      .insert(dashboards)
      .values({
        name: "用户增长看板",
        description: "用户增长和活跃度统计",
        config: {
          layout: "grid",
          theme: "dark",
        },
        createdBy: adminUser.id,
        isPublic: false,
      })
      .returning();

    if (!userDashboard) {
      throw new Error("Failed to create user dashboard");
    }

    const [overviewDashboard] = await db
      .insert(dashboards)
      .values({
        name: "数据概览",
        description: "综合数据总览和分析",
        config: {
          layout: "grid",
        },
        createdBy: testUser.id,
        isPublic: true,
      })
      .returning();

    if (!overviewDashboard) {
      throw new Error("Failed to create overview dashboard");
    }

    console.log("✅ Dashboards created:", {
      sales: salesDashboard.name,
      user: userDashboard.name,
      overview: overviewDashboard.name,
    });

    // 5. Create Widgets
    console.log("🎨 Creating widgets...");
    await db.insert(widgets).values([
      {
        dashboardId: salesDashboard.id,
        type: "line",
        title: "销售趋势",
        config: {
          dataSourceId: salesDataSource.id,
          showLegend: true,
          smooth: true,
        },
        position: { x: 0, y: 0, w: 6, h: 4 },
        order: 1,
      },
      {
        dashboardId: salesDashboard.id,
        type: "bar",
        title: "月度销售",
        config: {
          dataSourceId: salesDataSource.id,
          showLegend: true,
        },
        position: { x: 6, y: 0, w: 6, h: 4 },
        order: 2,
      },
      {
        dashboardId: userDashboard.id,
        type: "line",
        title: "用户增长趋势",
        config: {
          dataSourceId: userGrowthDataSource.id,
          showLegend: true,
        },
        position: { x: 0, y: 0, w: 8, h: 4 },
        order: 1,
      },
      {
        dashboardId: overviewDashboard.id,
        type: "pie",
        title: "设备分布",
        config: {
          dataSourceId: deviceDataSource.id,
          showLegend: true,
        },
        position: { x: 0, y: 0, w: 6, h: 4 },
        order: 1,
      },
      {
        dashboardId: overviewDashboard.id,
        type: "area",
        title: "收入趋势",
        config: {
          dataSourceId: salesDataSource.id,
          showLegend: true,
        },
        position: { x: 0, y: 4, w: 12, h: 4 },
        order: 2,
      },
    ]);

    console.log("✅ Widgets created");

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Summary:");
    console.log("  - Roles: 2 (admin, user)");
    console.log("  - Users: 3");
    console.log("    - admin@example.com / admin123");
    console.log("    - user@example.com / user123");
    console.log("    - demo@example.com / demo123");
    console.log("  - Data Sources: 3");
    console.log("  - Dashboards: 3");
    console.log("  - Widgets: 5");
    console.log("\n✨ You can now login with the test accounts!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seed };
