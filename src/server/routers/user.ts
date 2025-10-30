/**
 * User router
 */

import { users } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../trpc";
import { hashPassword, verifyPassword } from "./auth";

export const userRouter = router({
  // Get all users (admin only)
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const userList = await ctx.db.query.users.findMany({
        limit: input.limit,
        offset: input.offset,
        orderBy: (users, { desc }) => [desc(users.createdAt)],
      });

      // Remove password from response
      return userList.map(({ password, ...user }) => user);
    }),

  // Get user by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Remove password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  // Update user profile (own profile)
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        avatar: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updatedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    }),

  // Update user (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        username: z.string().min(3).max(100).optional(),
        avatar: z.string().url().optional(),
        isActive: z.boolean().optional(),
        emailVerified: z.boolean().optional(),
        roleId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    }),

  // Change password (own password)
  changePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current user with password
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify old password
      const isValid = await verifyPassword(input.oldPassword, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid current password",
        });
      }

      // Hash new password
      const hashedPassword = await hashPassword(input.newPassword);

      // Update password
      await ctx.db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  // Change password by admin (admin only)
  changePasswordByAdmin: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user exists
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Hash new password
      const hashedPassword = await hashPassword(input.newPassword);

      // Update password
      await ctx.db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Delete user (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),
});
