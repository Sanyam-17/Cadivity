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
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Cadivity <noreply@cadivity.com>",
        to: [user.email],
        subject: "Reset your Cadivity password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <h2 style="color:#0c2357;">Reset Your Password</h2>
            <p>Hi${user.name ? ` ${user.name}` : ''},</p>
            <p>We received a request to reset your Cadivity password. Click the button below to set a new password:</p>
            <a href="${url}" style="display:inline-block;background:#0c2357;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
              Reset Password
            </a>
            <p style="color:#888;font-size:12px;margin-top:24px;">
              If you didn't request this, you can safely ignore this email. This link will expire shortly.
            </p>
          </div>
        `,
      });
    },
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
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === "sign-in"
            ? "Your Cadivity sign-in code"
            : type === "forget-password"
            ? "Reset your Cadivity password"
            : "Cadivity - Verify Your Email";

        const intro =
          type === "sign-in"
            ? "Use this code to sign in to your Cadivity account:"
            : type === "forget-password"
            ? "Use this code to reset your Cadivity password:"
            : "Your verification code is:";

        await resend.emails.send({
          from: "Cadivity <noreply@cadivity.com>",
          to: [email],
          subject,
          html: `
            <p>${intro}</p>
            <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otp}</p>
            <p style="color:#888;font-size:12px;">
              This code expires shortly. If you didn't request this, you can safely ignore this email.
            </p>
          `,
        });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session