import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { orderId } = await request.json().catch(() => ({}));

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { merchantOrderId: orderId },
    include: { course: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Mark payment as completed
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "completed" },
  });

  // Create enrollment
  if (payment.studentId) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: payment.studentId,
          courseId: payment.courseId,
        },
      },
      update: {},
      create: {
        studentId: payment.studentId,
        courseId: payment.courseId,
      },
    });
  }

  return NextResponse.json({ success: true, courseSlug: payment.course.slug });
}
