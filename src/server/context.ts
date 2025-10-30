/**
 * tRPC Context
 */

import { db, users } from "@/db/index";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { eq } from "drizzle-orm";
import { verifyToken } from "./routers/auth";

export async function createContext(opts: FetchCreateContextFnOptions) {
  // Get request from opts
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
