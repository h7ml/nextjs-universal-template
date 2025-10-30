/**
 * Authentication router
 */

import { users } from "@/db/schema";
import { EnvManager } from "@/lib/env";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

// JWT Secret
const JWT_SECRET = new TextEncoder().encode(
  EnvManager.get("JWT_SECRET", "your-secret-key-change-this-in-production")
);

// Helper: Hash password (simple implementation, use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  // TODO: Use proper password hashing (bcrypt, argon2)
  return `hashed_${password}`;
}

// Helper: Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  // TODO: Use proper password verification
  return hash === `hashed_${password}`;
}

// Helper: Generate JWT
async function generateToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

// Helper: Verify JWT
export async function verifyToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

export const authRouter = router({
  // Register new user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        username: z.string().min(3).max(100),
        password: z.string().min(8),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password);

      // Create user
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email: input.email,
          username: input.username,
          password: hashedPassword,
          name: input.name,
        })
        .returning();

      if (!newUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      // Generate token
      const token = await generateToken(newUser.id);

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
        },
        token,
      };
    }),

  // Login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find user
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Verify password
      const isValid = await verifyPassword(input.password, user.password);

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Account is disabled",
        });
      }

      // Generate token
      const token = await generateToken(user.id);

      // Update last login
      await ctx.db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
        token,
      };
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Logout (optional, JWT is stateless)
  logout: protectedProcedure.mutation(async () => {
    // JWT logout is handled client-side by removing the token
    return { success: true };
  }),
});
