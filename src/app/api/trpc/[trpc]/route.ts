/**
 * tRPC API handler for Next.js App Router
 * 
 * Note: Using Node.js runtime to support database drivers (pg, mysql2, mongodb)
 * which require Node.js core modules (fs, path, stream, etc.)
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// Use Node.js runtime for database adapters compatibility
export const runtime = "nodejs";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`tRPC Error on ${path}:`, error);
    },
  });

export { handler as GET, handler as POST };
