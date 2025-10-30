/**
 * TypeScript type definitions for the universal template
 */

export type Platform = "vercel" | "local";

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
  VERCEL_ENV?: string;
}

// Declare global types for Edge Runtime
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      VERCEL?: string;
      VERCEL_ENV?: "development" | "preview" | "production";
      [key: string]: string | undefined;
    }
  }

  // Edge Runtime global
  const EdgeRuntime: string | undefined;
}

export {};
