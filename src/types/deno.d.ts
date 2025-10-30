/**
 * Deno Type Definitions
 * For TypeScript support in mixed Node.js/Deno environments
 */

// Deno global namespace
declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    has(key: string): boolean;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }

  const env: Env;
}

// Global Deno object
declare const Deno: {
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    has(key: string): boolean;
    delete(key: string): void;
    toObject(): Record<string, string>;
  };
};
