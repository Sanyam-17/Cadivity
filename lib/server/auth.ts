import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "https://cadivity-idrz.vercel.app/",

  trustedOrigins: [
    "https://cadivity.vercel.app",
    "https://www.cadivity.com",        // if you have a custom domain
    "https://cadivity.com",            // both www and non-www
    "http://localhost:3000",           // for local dev
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendVerificationOnSignUp: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false, // Only admin can assign roles
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await resend.emails.send({
          from: "Cadivity <noreply@cadivity.com>",
          to: [email],
          subject: "Cadivity - Verify Your Email",
          html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
        });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
