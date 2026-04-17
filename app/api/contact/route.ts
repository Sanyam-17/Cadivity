import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

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

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Cadivity Website" <${process.env.SMTP_USER}>`,
      to: "enquiry@cadivity.com",
      replyTo: data.email,
      subject: data.subject,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><b>Name:</b> ${data.name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Phone:</b> ${data.phone}</p>
        <p>${data.message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 400 }
    );
  }
}
