/**
 * Database connection for Deno runtime
 * Uses Web Standard API instead of Node.js specific APIs
 *
 * Note: This file is for Deno Deploy only.
 * In Node.js environment, use src/db/index.ts instead.
 */

// This file uses Deno-specific imports which are only valid in Deno runtime
// TypeScript will show errors in Node.js environment, but that's expected
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - Allow Deno-specific code

/**
 * Create database connection for Deno runtime
 *
 * In Deno Deploy, we can use Neon HTTP client which works via fetch API.
 * For full Deno support, you may need to use a Deno-compatible PostgreSQL client.
 *
 * Example usage in deno_server.ts:
 * ```typescript
 * import { createDenoDb } from './src/db/deno.ts'
 * const db = createDenoDb()
 * ```
 */
export async function createDenoDb(databaseUrl?: string) {
  // Dynamic import for Deno runtime only
  if (typeof Deno === "undefined") {
    throw new Error("This function is only available in Deno runtime");
  }

  const dbUrl = databaseUrl || Deno.env.get("DATABASE_URL");

  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // For Deno, use Neon HTTP client which works with fetch API
  // Neon HTTP client is compatible with Deno's Web Standard API
  try {
    // Use dynamic import to avoid TypeScript errors in Node.js environment
    const { neon } = await import("https://esm.sh/@neondatabase/serverless@1");
    const { drizzle } = await import(
      "https://esm.sh/drizzle-orm@0.44.5/neon-http"
    );
    const schemaModule = await import("./schema.ts");
    const schema = schemaModule;

    const sql = neon(dbUrl);
    const db = drizzle(sql, { schema });

    return db;
  } catch (error) {
    console.error("Failed to create Deno database connection:", error);
    throw error;
  }
}

// Export schema (works in both environments)
export * from "./schema.ts";
