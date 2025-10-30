/**
 * Fix database: Remove old UserRole enum type
 * Run with: tsx scripts/fix-db.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { neon } from "@neondatabase/serverless";

// Load environment variables
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (existsSync(envPath)) {
  config({ path: envPath });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function fixDatabase() {
  console.log("🔧 Fixing database...\n");

  try {
    // Step 1: Drop role column if exists
    console.log('1. Checking for old "role" column...');
    try {
      await sql`
        ALTER TABLE IF EXISTS "public"."universal_users" 
        DROP COLUMN IF EXISTS "role"
      `;
      console.log('   ✅ Dropped old "role" column (if existed)');
    } catch (error: any) {
      if (!error?.message?.includes("does not exist")) {
        console.warn("   ⚠️  Could not drop role column:", error.message);
      } else {
        console.log('   ℹ️  No old "role" column found');
      }
    }

    // Step 2: Drop UserRole enum with CASCADE
    console.log('2. Dropping old "UserRole" enum type...');
    try {
      await sql`DROP TYPE IF EXISTS "public"."UserRole" CASCADE`;
      console.log('   ✅ Dropped "UserRole" enum type');
    } catch (error: any) {
      console.warn("   ⚠️  Error dropping UserRole:", error.message);
    }

    console.log("\n✅ Database fixed!");
    console.log("\n现在可以运行: pnpm db:push");
  } catch (error) {
    console.error("❌ Error fixing database:", error);
    process.exit(1);
  }
}

fixDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
