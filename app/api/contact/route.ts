import { NextResponse } from "next/server";
import { z } from "zod";
import { resend } from "@/lib/resend";
import { getContactNotificationEmailHtml } from "@/lib/emails/contact-notification-email";
import { getAutoReplyEmailHtml } from "@/lib/emails/auto-reply-email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  subject: z.string().min(5),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
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
      console.error("Resend error:", error);

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
        // Log but don't fail the request if auto-reply fails
        console.error("Auto-reply email error:", err);
      });

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