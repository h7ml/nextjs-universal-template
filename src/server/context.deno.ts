/**
 * tRPC Context for Deno runtime
 */

import { type FetchCreateContextFnOptions } from "https://esm.sh/@trpc/server@11.6.0/adapters/fetch";
import { db } from "@/db/deno.ts";
import { verifyToken } from "./routers/auth.deno.ts";
import { eq } from "https://esm.sh/drizzle-orm@0.44.5";
import { users } from "@/db/schema.ts";

export async function createContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts;

  // Extract user from JWT token (if exists)
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || null;

  let user = null;

  // Verify JWT and extract user
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      const userRecord = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
      });
      if (userRecord && userRecord.isActive) {
        // Remove password from user object
        const { password, ...userWithoutPassword } = userRecord;
        user = userWithoutPassword;
      }
    }
  }

  return {
    db,
    req,
    token,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
