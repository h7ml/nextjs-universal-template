/**
 * TypeScript type definitions for the universal template
 */

export type Platform = "vercel" | "deno" | "cloudflare" | "local";

export type Runtime = "edge" | "nodejs";

export type Environment = "development" | "preview" | "production";

export interface PlatformInfo {
  platform: Platform;
  runtime: Runtime;
  isProduction: boolean;
  isDevelopment: boolean;
  isPreview: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  platformInfo?: {
    platform: Platform;
    runtime: Runtime;
    environment: Environment;
  };
}

// Environment variable types
export interface SafeEnvVars {
  NODE_ENV: string;
  VERCEL?: boolean;
  DENO?: boolean;
  CF_PAGES?: boolean;
  VERCEL_ENV?: string;
  CF_PAGES_BRANCH?: string;
}

// Declare global types for Edge Runtime
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      VERCEL?: string;
      DENO?: string;
      CF_PAGES?: string;
      CLOUDFLARE_PAGES?: string;
      DENO_DEPLOYMENT_ID?: string;
      // NODE_ENV is already defined in @types/node, don't redeclare
      // NODE_ENV?: 'development' | 'production' | 'test'
      VERCEL_ENV?: "development" | "preview" | "production";
      CF_PAGES_BRANCH?: string;
      [key: string]: string | undefined;
    }
  }

  // Edge Runtime global
  const EdgeRuntime: string | undefined;
}

export {};
