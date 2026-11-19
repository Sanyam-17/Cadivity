import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/server/db";
import { auth } from "@/lib/server/auth";
import { logger } from "@/lib/server/logger";
import { resend } from "@/lib/server/resend";
import { getEnrollmentConfirmationEmailHtml } from "@/lib/server/emails/enrollment-confirmation-email";

// ─── completeOrder ────────────────────────────────────────────────────────────
// Shared logic for marking a payment as paid, resolving/creating the student
// account (for guest checkouts), creating the enrollment, and sending the
// confirmation email + sign-in OTP. Used by both the real Razorpay webhook
// (payment.captured) and the dev-only /api/dev/simulate-payment route, so
// that manual testing exercises the exact same path as production.
//
// Returns a plain result object — callers are responsible for wrapping this
// in whatever HTTP response shape they use (successResponse/errorResponse,
// NextResponse.json, etc).

export interface CompleteOrderParams {
  merchantOrderId: string;
  transactionId: string | null;
}

export type CompleteOrderResult =
  | { ok: true; alreadyProcessed: true }
  | {
      ok: true;
      alreadyProcessed: false;
      enrollmentId: string;
      studentId: string;
      courseId: string;
      courseSlug: string;
      newAccountCreated: boolean;
    }
  | { ok: false; status: number; error: string };

export async function completeOrder(
  params: CompleteOrderParams
): Promise<CompleteOrderResult> {
  const { merchantOrderId, transactionId } = params;

  if (!merchantOrderId) {
    logger.error("completeOrder.missingOrderId");
    return { ok: false, status: 400, error: "Missing merchantOrderId" };
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
      logger.error("completeOrder.paymentNotFound", { merchantOrderId });
      return { ok: false, status: 404, error: "Payment not found" };
    }

    // ── Idempotency check ────────────────────────────────────────────────
    if (payment.status === "paid") {
      logger.info("completeOrder.alreadyPaid", {
        merchantOrderId,
        paymentId: payment.id,
      });
      return { ok: true, alreadyProcessed: true };
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
        logger.error("completeOrder.missingGuestDetails", { merchantOrderId });
        return {
          ok: false,
          status: 400,
          error: "Payment is missing guest account details",
        };
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
      logger.error("completeOrder.unresolvedStudent", { merchantOrderId });
      return {
        ok: false,
        status: 500,
        error: "Unable to resolve student account",
      };
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
          razorpayPaymentId: transactionId ?? null,
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
        from: "Cadivity <onboarding@resend.dev>",
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

    return {
      ok: true,
      alreadyProcessed: false,
      enrollmentId: result.enrollment.id,
      studentId,
      courseId: payment.courseId,
      courseSlug: payment.course.slug,
      newAccountCreated,
    };
  } catch (error) {
    logger.error("completeOrder.error", {
      merchantOrderId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      status: 500,
      error: "Failed to process payment completion",
    };
  }
}