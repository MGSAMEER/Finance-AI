/**
 * Environment variables utility
 * Provides type-safe access to environment variables with fallbacks
 */

export const env = {
  // Database configuration
  DB_RESET_ON_SCHEMA_CHANGE: process.env.NEXT_PUBLIC_DB_RESET_ON_SCHEMA_CHANGE === "true",
  
  // Application configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Finance AI",
  
  // Development settings
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
  DEFAULT_LANGUAGE: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en",
  
  // AI integration (optional)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
} as const;

/**
 * Type-safe environment variable getter with fallback
 */
export function getEnvVar(key: keyof typeof env): string | boolean {
  return env[key];
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development" || env.DEBUG_MODE;
}

/**
 * Check if AI features are enabled (API key is present)
 */
export function isAIEnabled(): boolean {
  return env.OPENAI_API_KEY.length > 0;
}
