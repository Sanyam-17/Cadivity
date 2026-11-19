import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    RESEND_API_KEY: z.string().min(1),
    /** A verified Resend sender, for example: Cadivity <hello@cadivity.com>. */
    RESEND_FROM: z.string().min(1).optional(),
    ARCJET_KEY: z.string().min(1),
    // ── Razorpay Payment Gateway ─────────────────────────────────────────
    // Use rzp_test_... keys for the test gateway, rzp_live_... for production.
    RAZORPAY_KEY_ID: z.string().min(1),
    RAZORPAY_KEY_SECRET: z.string().min(1),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
    RAZORPAY_MODE: z.enum(["test", "live"]),
    /** Comma-separated list of allowed browser origins for better-auth */
    TRUSTED_ORIGINS: z.string().optional(),
  },

  client: {
    // Public key ID — safe to expose, used by Razorpay Checkout.js in the browser.
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
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