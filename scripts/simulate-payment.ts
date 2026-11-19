// scripts/simulate-payment.ts
// Local-only helper to test the payment → enrollment flow without a real
// PhonePe round-trip. Not part of the deployed app — no HTTP route exists,
// so there's nothing to misconfigure or accidentally expose in production.
//
// Usage: pnpm exec tsx scripts/simulate-payment.ts <merchantOrderId>

import "dotenv/config"; // loads .env locally; remove if your setup already does this

import { prisma } from "../lib/server/db";

async function main() {
  const orderId = process.argv[2];
  if (!orderId) {
    console.error("Usage: pnpm exec tsx scripts/simulate-payment.ts <merchantOrderId>");
    process.exit(1);
  }

  const payment = await prisma.payment.findUnique({
    where: { merchantOrderId: orderId },
    include: { course: true },
  });

  if (!payment) {
    console.error(`No payment found for merchantOrderId: ${orderId}`);
    process.exit(1);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "paid" }, // matches the real webhook's status value
  });

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
        progress: 0,
      },
    });
  }

  console.log(`✔ Payment ${orderId} marked paid, enrollment ensured for "${payment.course.slug}".`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());