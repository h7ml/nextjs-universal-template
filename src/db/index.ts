/**
 * Database connection and utilities
 * Platform-aware: Uses Node.js or Deno adapter based on runtime
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Helper to get database URL from environment
function getDatabaseUrl(): string | undefined {
  // Try process.env first (for Node.js)
  if (typeof process !== "undefined" && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Try Deno.env (for Deno runtime)
  if (typeof Deno !== "undefined" && Deno.env.get("DATABASE_URL")) {
    return Deno.env.get("DATABASE_URL");
  }
  return undefined;
}

// Lazy initialization - only connect to database at runtime, not at build time
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  // Get database URL
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    // In Deno, fallback to Deno.env
    if (typeof Deno !== "undefined") {
      const denoUrl = Deno.env.get("DATABASE_URL");
      if (denoUrl) {
        // For Deno, use a different adapter
        // This will be handled by deno.ts import
        throw new Error("Please import from ./deno.ts in Deno runtime");
      }
    }

    // Only throw error at runtime, not during build
    // During build, Next.js might analyze modules but DATABASE_URL might not be set
    // We'll provide a helpful error message only when actually trying to use the database
    const errorMessage = `
DATABASE_URL environment variable is not set.

Please create a .env.local file in the project root with:
DATABASE_URL=postgresql://user:password@host:5432/database

Example:
1. Copy .env.example to .env.local
2. Update DATABASE_URL with your PostgreSQL connection string

For development, you can use:
- Neon Serverless (free tier): https://neon.tech
- Local PostgreSQL
- Or any PostgreSQL database
    `.trim();

    throw new Error(errorMessage);
  }

  // Create Neon HTTP client (Node.js/Browser/Edge)
  const sql = neon(databaseUrl);

  // Create Drizzle instance
  dbInstance = drizzle(sql, { schema });
  return dbInstance;
}

// Export a getter function that initializes on first access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

// Export schema
export * from "./schema";
