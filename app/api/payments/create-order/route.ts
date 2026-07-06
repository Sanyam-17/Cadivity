import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { auth } from "@/lib/server/auth";
import { guardApiExactRole } from "@/lib/server/auth-guard";
import {
  successResponse,
  errorResponse,
  validationError,
} from "@/lib/server/api-utils";
import { withRateLimit } from "@/lib/server/arcjet";
import { logger } from "@/lib/server/logger";
import { createOrder } from "@/lib/server/phonepe";
import { z } from "zod";

// ── Rate limiters ─────────────────────────────────────────────────────────
// Authenticated checkouts get a more generous limit; anonymous guest
// checkouts are stricter to avoid PhonePe order spam from unauthenticated traffic.
const authenticatedLimiter = withRateLimit(10, 60);
const guestLimiter = withRateLimit(5, 60);

const createOrderSchema = z.object({
  courseSlug: z.string().min(1),
  // Guest checkout fields — required only when there is no session.
  guestName: z.string().trim().min(2).max(100).optional(),
  guestEmail: z.string().trim().email().optional(),
  guestPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional(),
});

// ─── POST /api/payments/create-order ─────────────────────────────────────────
// Initiates a PhonePe Standard Checkout payment for a published, paid course.
//
// Supports TWO callers:
//  1. Authenticated students (existing behaviour)
//  2. Anonymous guests (NEW) — they supply guestName/guestEmail/guestPhone.
//     studentId stays null on the Payment record until the webhook resolves
//     (or creates) the account on successful payment.

export async function POST(request: NextRequest) {
  // 1. Detect session presence first — determines rate limit + flow branch
  const session = await auth.api.getSession({ headers: request.headers });
  const isGuestCheckout = !session;

  // 2. Rate limit
  const aj = isGuestCheckout ? guestLimiter : authenticatedLimiter;
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    return errorResponse("Too many requests", 429);
  }

  // 3. Parse + validate body
  const body = await request.json().catch(() => ({}));
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }
  const { courseSlug, guestName, guestEmail, guestPhone } = parsed.data;

  // 4. Resolve student / guest identity
  let studentId: string | null = null;

  if (!isGuestCheckout) {
    // Authenticated path — reuse the existing role guard (handles role,
    // active, and email-verification checks)
    const guarded = await guardApiExactRole("student");
    if (guarded.error) return guarded.error;
    studentId = guarded.session.user.id;
  } else {
    // Guest path — all three fields are required
    if (!guestName || !guestEmail || !guestPhone) {
      return errorResponse(
        "Name, email, and phone number are required to continue.",
        400
      );
    }
  }

  try {
    // 5. Find course
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true, title: true, slug: true, status: true, price: true },
    });

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    // 6. Must be published with a price > 0
    if (course.status !== "published") {
      return errorResponse("Course is not open for enrollment", 400);
    }
    if (!course.price || course.price <= 0) {
      return errorResponse("This course does not require payment", 400);
    }

    // 7. Check not already enrolled
    if (studentId) {
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId,
            courseId: course.id,
          },
        },
      });
      if (existingEnrollment) {
        return errorResponse("You are already enrolled in this course", 409);
      }
    } else if (guestEmail) {
      // Guest checkout — if this email already has an account AND is already
      // enrolled, point them to login instead of letting them pay again.
      const existingUser = await prisma.user.findUnique({
        where: { email: guestEmail },
        select: { id: true },
      });

      if (existingUser) {
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: existingUser.id,
              courseId: course.id,
            },
          },
        });
        if (existingEnrollment) {
          return errorResponse(
            "An account with this email is already enrolled in this course. Please log in.",
            409
          );
        }
      }
    }

    // 8. Generate unique merchant order ID
    const merchantOrderId = crypto.randomUUID();

    // 9. Build redirect URL — PhonePe sends the student back here after payment
    const origin = request.headers.get("origin") || request.headers.get("host") || "";
    const protocol = origin.startsWith("http") ? "" : "https://";
    const redirectUrl = `${protocol}${origin}/api/payments/redirect?merchantOrderId=${merchantOrderId}`;

    // 10. Call PhonePe
    const result = await createOrder({
      merchantOrderId,
      amount: course.price,
      redirectUrl,
    });

    // 11. Persist Payment record
    await prisma.payment.create({
      data: {
        merchantOrderId,
        phonepeOrderId: result.phonepeOrderId,
        amount: course.price,
        currency: "INR",
        status: "created",
        courseId: course.id,
        studentId, // null for guest checkouts — resolved in the webhook
        guestName: studentId ? null : guestName,
        guestEmail: studentId ? null : guestEmail,
        guestPhone: studentId ? null : guestPhone,
      },
    });

    logger.info("payment.created", {
      merchantOrderId,
      phonepeOrderId: result.phonepeOrderId,
      amount: course.price,
      courseId: course.id,
      studentId,
      isGuestCheckout,
    });

    // 12. Return to frontend — it will redirect the browser to PhonePe checkout
    return successResponse(
      {
        merchantOrderId,
        phonepeOrderId: result.phonepeOrderId,
        redirectUrl: result.redirectUrl,
        amount: course.price,
        currency: "INR",
      },
      201
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.log("[v0] Payment creation error:", {
      message: errorMessage,
      stack: errorStack,
      studentId,
      courseSlug,
    });
    
    logger.error("payment.create.failed", {
      error: errorMessage,
      stack: errorStack,
      studentId,
      courseSlug,
    });
    return errorResponse(`Failed to initiate payment: ${errorMessage}`, 500);
  }
}
