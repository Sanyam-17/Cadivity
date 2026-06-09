import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
 
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    AUTH_GOOGLE_CLIENT_ID: z.string().min(1),
    AUTH_GOOGLE_CLIENT_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    /** Comma-separated list of allowed browser origins for better-auth */
    TRUSTED_ORIGINS: z.string().optional(),
  },

  experimental__runtimeEnv: {},
});

export function getTrustedOrigins(): string[] {
  const fromEnv = env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];
  const defaults = [
    env.BETTER_AUTH_URL,
    "http://localhost:3000",
    "https://www.cadivity.com",
    "https://cadivity.com",
  ];
  return Array.from(new Set([...fromEnv, ...defaults]));
}