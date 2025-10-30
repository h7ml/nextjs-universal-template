/**
 * Platform detection and adaptation utilities
 * Supports: Vercel, Docker, Local
 */

import type { Platform } from "@/types";

export type { Platform };

export interface PlatformInfo {
  platform: Platform;
  runtime: "edge" | "nodejs";
  isProduction: boolean;
  isDevelopment: boolean;
  isPreview: boolean;
}

/**
 * Detect current deployment platform
 */
export function detectPlatform(): Platform {
  if (typeof process !== "undefined") {
    if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL) {
      return "vercel";
    }
  }

  return "local";
}

/**
 * Get comprehensive platform information
 */
export function getPlatformInfo(): PlatformInfo {
  const platform = detectPlatform();
  const nodeEnv =
    typeof process !== "undefined"
      ? process.env.NODE_ENV || "development"
      : "development";

  const isProduction = nodeEnv === "production";
  const isDevelopment = nodeEnv === "development";
  const isPreview =
    typeof process !== "undefined"
      ? !!(process.env.VERCEL_ENV === "preview")
      : false;

  // Detect runtime - Edge Runtime doesn't have full Node.js APIs
  const runtime = typeof EdgeRuntime !== "undefined" ? "edge" : "nodejs";

  return {
    platform,
    runtime,
    isProduction,
    isDevelopment,
    isPreview,
  };
}

/**
 * Get platform-specific environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  if (typeof process === "undefined") {
    return defaultValue;
  }
  return process.env[key] || defaultValue;
}

/**
 * Check if running on specific platform
 */
export function isPlatform(platform: Platform): boolean {
  return detectPlatform() === platform;
}

/**
 * Check if running on edge runtime
 */
export function isEdgeRuntime(): boolean {
  return typeof EdgeRuntime !== "undefined";
}

/**
 * Platform-specific logging (for debugging)
 */
export function logPlatformInfo(): void {
  if (typeof console !== "undefined") {
    const info = getPlatformInfo();
    console.log("[Platform Info]", {
      platform: info.platform,
      runtime: info.runtime,
      environment: info.isProduction
        ? "production"
        : info.isDevelopment
          ? "development"
          : "preview",
    });
  }
}
