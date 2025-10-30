-- Fix database: Remove old UserRole enum and related columns
-- Run this SQL script if you encounter "cannot drop type UserRole" error

-- Step 1: Drop the role column if it exists in users table
ALTER TABLE IF EXISTS "public"."universal_users" 
DROP COLUMN IF EXISTS "role";

-- Step 2: Drop the UserRole enum type with CASCADE
DROP TYPE IF EXISTS "public"."UserRole" CASCADE;

-- Note: After running this, you can run `pnpm db:push` again

