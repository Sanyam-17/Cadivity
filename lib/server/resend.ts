import "server-only";
import { Resend } from "resend";
import { env } from "../env";
import { logger } from "./logger";

export const resend = new Resend(env.RESEND_API_KEY);

export const emailFrom = env.RESEND_FROM ?? "Cadivity <onboarding@resend.dev>";

type SendEmailInput = Parameters<typeof resend.emails.send>[0];

/**
 * Resend reports provider failures in its returned `error` field instead of
 * rejecting. Centralizing this check prevents false-positive delivery logs.
 */
export async function sendEmail(input: SendEmailInput) {
  const { data, error } = await resend.emails.send(input);

  if (error) {
    logger.error("email.send.failed", {
      name: error.name,
      message: error.message,
      to: Array.isArray(input.to) ? input.to.join(",") : input.to,
    });
    throw new Error(`Email delivery failed: ${error.message}`);
  }


  return data;
}
