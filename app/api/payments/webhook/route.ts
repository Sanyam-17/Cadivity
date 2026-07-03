import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/server/db";
import { auth } from "@/lib/server/auth";
import { successResponse, errorResponse } from "@/lib/server/api-utils";
import { withRateLimit } from "@/lib/server/arcjet";
import { logger } from "@/lib/server/logger";
import { verifyWebhookSignature } from "@/lib/server/phonepe";
import { resend } from "@/lib/server/resend";
import { getEnrollmentConfirmationEmailHtml } from "@/lib/server/emails/enrollment-confirmation-email";

const aj = withRateLimit(20, 60);

interface WebhookPayload {
  event: string;
  payload: {
    merchantOrderId: string;
    state: string;
    transactionId?: string;
    amount?: number;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    return errorResponse("Too many requests", 429);
  }

  const rawBody = await request.text();
  const signatureHeader =
    request.headers.get("x-phonepe-signature") ||
    request.headers.get("X-PhonePe-Signature") ||
    "";

  if (!verifyWebhookSignature(rawBody, signatureHeader)) {
    logger.error("webhook.signatureInvalid", {
      signatureHeader: signatureHeader.substring(0, 12) + "…",
    });
    return errorResponse("Invalid signature", 401);
  }

  let webhookData: WebhookPayload;
  try {
    webhookData = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    logger.error("webhook.invalidJson");
    return errorResponse("Invalid JSON payload", 400);
  }

  const { event, payload } = webhookData;

  logger.info("webhook.received", {
    event,
    merchantOrderId: payload?.merchantOrderId,
    state: payload?.state,
  });

  switch (event) {
    case "checkout.order.completed":
      return handleOrderCompleted(payload);

    case "checkout.order.failed":
      return handleOrderFailed(payload);

    default:
      logger.info("webhook.ignoredEvent", { event });
      return successResponse({ received: true });
  }
}

// ─── checkout.order.completed ────────────────────────────────────────────────

async function handleOrderCompleted(payload: WebhookPayload["payload"]) {
  const { merchantOrderId, transactionId } = payload;

  if (!merchantOrderId) {
    logger.error("webhook.completed.missingOrderId");
    return errorResponse("Missing merchantOrderId", 400);
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { merchantOrderId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (!payment) {
      logger.error("webhook.completed.paymentNotFound", { merchantOrderId });
      return errorResponse("Payment not found", 404);
    }

    // ── Idempotency check ────────────────────────────────────────────────
    if (payment.status === "paid") {
      logger.info("webhook.completed.alreadyPaid", {
        merchantOrderId,
        paymentId: payment.id,
      });
      return successResponse({ received: true, alreadyProcessed: true });
    }

    // ── Resolve the student account ──────────────────────────────────────
    // Authenticated checkouts already have studentId + student set.
    // Guest checkouts arrive here with studentId === null and
    // guestEmail/guestPhone/guestName populated — resolve (or create)
    // the account now, BEFORE creating the enrollment.
    let studentId = payment.studentId;
    let studentEmail = payment.student?.email ?? null;
    let studentName = payment.student?.name ?? null;
    let newAccountCreated = false;

    if (!studentId) {
      if (!payment.guestEmail || !payment.guestName) {
        logger.error("webhook.completed.missingGuestDetails", { merchantOrderId });
        return errorResponse("Payment is missing guest account details", 400);
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: payment.guestEmail },
        select: { id: true, name: true, email: true },
      });

      if (existingUser) {
        studentId = existingUser.id;
        studentEmail = existingUser.email;
        studentName = existingUser.name;

        logger.info("account.linked.existing", {
          merchantOrderId,
          userId: existingUser.id,
        });
      } else {
        // Create a new account using a securely generated random password.
        // The user signs in passwordlessly afterwards via emailOTP "sign-in".
        const randomPassword = randomBytes(24).toString("hex");

        const signUpResult = await auth.api.signUpEmail({
          body: {
            email: payment.guestEmail,
            password: randomPassword,
            name: payment.guestName,
          },
        });

        const newUserId = signUpResult.user.id;

        // signUpEmail creates the account with emailVerified: false (and may
        // fire a separate "verify your email" OTP via sendVerificationOnSignUp).
        // A completed payment to this inbox is strong proof of ownership, so
        // mark it verified immediately. Also persist the phone number, which
        // better-auth's signup flow doesn't accept directly.
        await prisma.user.update({
          where: { id: newUserId },
          data: { emailVerified: true, phone: payment.guestPhone ?? null },
        });

        studentId = newUserId;
        studentEmail = payment.guestEmail;
        studentName = payment.guestName;
        newAccountCreated = true;

        logger.info("account.autocreated", {
          merchantOrderId,
          userId: newUserId,
          email: payment.guestEmail,
        });
      }
    }

    if (!studentEmail || !studentName) {
      logger.error("webhook.completed.unresolvedStudent", { merchantOrderId });
      return errorResponse("Unable to resolve student account", 500);
    }

    // ── Atomic transaction: link payment to student + create enrollment ──
    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: studentId!,
          courseId: payment.courseId,
          progress: 0,
        },
      });

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          phonepeTransactionId: transactionId ?? null,
          enrollmentId: enrollment.id,
          studentId, // backfill for guest checkouts
        },
      });

      return { enrollment, updatedPayment };
    });

    logger.info("payment.completed", {
      merchantOrderId,
      paymentId: payment.id,
      enrollmentId: result.enrollment.id,
      studentId,
      courseId: payment.courseId,
      transactionId: transactionId ?? null,
    });

    // ── Send enrollment confirmation email ───────────────────────────────
    try {
      await resend.emails.send({
        from: "Cadivity <noreply@cadivity.com>",
        to: studentEmail,
        subject: `Enrollment Confirmed — ${payment.course.title}`,
        html: getEnrollmentConfirmationEmailHtml({
          studentName,
          courseTitle: payment.course.title,
          courseSlug: payment.course.slug,
          amountPaise: payment.amount,
          merchantOrderId,
        }),
      });
      logger.info("payment.enrollmentEmailSent", {
        studentEmail,
        merchantOrderId,
      });
    } catch (emailError) {
      logger.error("payment.enrollmentEmailFailed", {
        error:
          emailError instanceof Error
            ? emailError.message
            : String(emailError),
        merchantOrderId,
      });
    }

    // ── New guest account: send a passwordless sign-in code ───────────────
    if (newAccountCreated) {
      try {
        await auth.api.sendVerificationOTP({
          body: { email: studentEmail, type: "sign-in" },
        });
        logger.info("payment.signInOtpSent", { studentEmail, merchantOrderId });
      } catch (otpError) {
        logger.error("payment.signInOtpFailed", {
          error:
            otpError instanceof Error ? otpError.message : String(otpError),
          merchantOrderId,
        });
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    logger.error("webhook.completed.error", {
      merchantOrderId,
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse("Failed to process payment completion", 500);
  }
}

// ─── checkout.order.failed ───────────────────────────────────────────────────

async function handleOrderFailed(payload: WebhookPayload["payload"]) {
  const { merchantOrderId } = payload;

  if (!merchantOrderId) {
    logger.error("webhook.failed.missingOrderId");
    return errorResponse("Missing merchantOrderId", 400);
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { merchantOrderId },
      select: { id: true, status: true, studentId: true, courseId: true },
    });

    if (!payment) {
      logger.error("webhook.failed.paymentNotFound", { merchantOrderId });
      return errorResponse("Payment not found", 404);
    }

    if (payment.status === "paid") {
      logger.warn("webhook.failed.alreadyPaid", { merchantOrderId });
      return successResponse({ received: true, alreadyProcessed: true });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    });

    logger.error("payment.failed", {
      merchantOrderId,
      paymentId: payment.id,
      studentId: payment.studentId,
      courseId: payment.courseId,
    });

    return successResponse({ received: true });
  } catch (error) {
    logger.error("webhook.failed.error", {
      merchantOrderId,
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse("Failed to process payment failure", 500);
  }
}