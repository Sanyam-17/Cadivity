import { NextResponse } from "next/server";
import { z } from "zod";
import { resend } from "@/lib/server/resend";
import { getContactNotificationEmailHtml } from "@/lib/server/emails/contact-notification-email";
import { getAutoReplyEmailHtml } from "@/lib/server/emails/auto-reply-email";
import { withRateLimit } from "@/lib/server/arcjet";
import { logger } from "@/lib/server/logger";
import { getRequestIp } from "@/lib/server/auth-guard";

const aj = withRateLimit(5, 60);

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  subject: z.string().min(5),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = schema.parse(body);

    // 1. Send notification email to Cadivity team
    const { data: result, error } = await resend.emails.send({
      from: "Cadivity <noreply@contact.cadivity.com>",
      to: ["enquiry@cadivity.com"],
      replyTo: data.email,
      subject: `[Contact Form] ${data.subject}`,
      html: getContactNotificationEmailHtml({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      }),
    });

    if (error) {
      logger.error("contact.email.failed", { error: error.message });

      return NextResponse.json(
        { error: error.message || "Failed to send message" },
        { status: 500 }
      );
    }

    // 2. Send auto-reply confirmation to user (fire-and-forget)
    resend.emails
      .send({
        from: "Cadivity <noreply@contact.cadivity.com>",
        to: [data.email],
        subject: `Thanks for contacting Cadivity — ${data.subject}`,
        html: getAutoReplyEmailHtml({
          name: data.name,
          subject: data.subject,
        }),
      })
      .catch((err) => {
        logger.warn("contact.autoreply.failed", { error: String(err) });
      });

    logger.info("contact.submitted", { email: data.email });

    return NextResponse.json({
      success: true,
      id: result?.id,
    });

  } catch (err) {
    console.error("Contact form error:", err);

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 400 }
    );
  }
}
