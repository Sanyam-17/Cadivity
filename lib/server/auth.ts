import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";
import { getTrustedOrigins } from "../env";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,

  trustedOrigins: getTrustedOrigins(),

  database: prismaAdapter(prisma, { provider: "postgresql" }),
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
        input: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
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
