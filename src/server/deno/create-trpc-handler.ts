/**
 * Create tRPC handler for Deno runtime
 * This dynamically imports and uses the same tRPC router and context
 */

export async function createDenoTrpcHandler() {
  try {
    // Import tRPC dependencies (using ESM URLs for Deno)
    const { fetchRequestHandler } = await import(
      "https://esm.sh/@trpc/server@11.6.0/adapters/fetch"
    );

    // Import router (using relative paths - Deno can import local files)
    const routerModule = await import("../routers/_app.ts");
    const appRouter = routerModule.appRouter;

    // Create Deno-compatible context
    async function createDenoContext(opts: any) {
      // Import Deno-specific modules
      const { createDenoDb } = await import("../../db/deno.ts");
      const { users } = await import("../../db/schema.ts");
      const { verifyToken } = await import("../routers/auth.ts");
      const { eq } = await import("https://esm.sh/drizzle-orm@0.44.5");

      const db = await createDenoDb();
      const { req } = opts;

      // Extract user from JWT token
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "") || null;

      let user = null;

      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          const userRecord = await db.query.users.findFirst({
            where: eq(users.id, payload.userId),
          });
          if (userRecord && userRecord.isActive) {
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

    // Return the handler
    return async (req: Request): Promise<Response> => {
      return fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: createDenoContext,
        onError({ error, path }) {
          console.error(`[Deno] tRPC Error on ${path}:`, error);
        },
      });
    };
  } catch (error) {
    console.error("[Deno] Failed to create tRPC handler:", error);
    throw error;
  }
}
