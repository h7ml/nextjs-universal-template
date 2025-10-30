/**
 * Unified environment variable handling
 * Ensures safe and consistent access across platforms
 */

import { getEnv } from "./platform";

/**
 * Safe environment variable access
 * Only exposes non-sensitive variables
 */
export class EnvManager {
  /**
   * Get environment variable safely
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   */
  static get(key: string, defaultValue?: string): string | undefined {
    return getEnv(key, defaultValue);
  }

  /**
   * Get required environment variable
   * @throws Error if variable is not set
   */
  static getRequired(key: string): string {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Get boolean environment variable
   */
  static getBoolean(key: string, defaultValue = false): boolean {
    const value = this.get(key);
    if (!value) return defaultValue;
    return value.toLowerCase() === "true" || value === "1";
  }

  /**
   * Get number environment variable
   */
  static getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.get(key);
    if (!value) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Get safe environment variables for client-side exposure
   * Only includes variables prefixed with NEXT_PUBLIC_
   */
  static getPublicVars(): Record<string, string | undefined> {
    const publicVars: Record<string, string | undefined> = {};

    if (typeof process !== "undefined" && process.env) {
      Object.keys(process.env).forEach((key) => {
        if (key.startsWith("NEXT_PUBLIC_")) {
          publicVars[key] = process.env[key];
        }
      });
    }

    return publicVars;
  }

  /**
   * Get deployment platform information (safe for exposure)
   */
  static getPlatformInfo() {
    return {
      VERCEL: this.getBoolean("VERCEL", false),
      NODE_ENV: this.get("NODE_ENV", "development"),
      VERCEL_ENV: this.get("VERCEL_ENV"),
    };
  }
}
