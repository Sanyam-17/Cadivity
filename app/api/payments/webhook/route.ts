import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/server/api-utils";
import { withRateLimit } from "@/lib/server/arcjet";
import { logger } from "@/lib/server/logger";
import { verifyWebhookSignature } from "@/lib/server/razorpay";
import { completeOrder } from "@/lib/server/payments/complete-order";
import { prisma } from "@/lib/server/db";

const aj = withRateLimit(20, 60);

// ─── Razorpay Webhook Payload ────────────────────────────────────────────────
// Razorpay's webhook body shape: { event, payload: { payment: { entity }, order?: { entity } } }
// The order's `receipt` field carries our merchantOrderId (set at order creation).

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string; // payment id (pay_xxx)
        order_id: string; // rzp order id (order_xxx)
        status: string;
        amount: number;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity: {
        id: string;
        receipt?: string;
        notes?: Record<string, string>;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    return errorResponse("Too many requests", 429);
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signatureHeader)) {
    logger.error("webhook.signatureInvalid", {
      signatureHeader: signatureHeader.substring(0, 12) + "…",
    });
    return errorResponse("Invalid signature", 401);
  }

  let webhookData: RazorpayWebhookPayload;
  try {
    webhookData = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    logger.error("webhook.invalidJson");
    return errorResponse("Invalid JSON payload", 400);
  }

  const { event, payload } = webhookData;
  const paymentEntity = payload?.payment?.entity;
  const orderEntity = payload?.order?.entity;

  // merchantOrderId was stored as the Razorpay order's `receipt` at creation
  // time, and also mirrored into notes as a fallback.
  const merchantOrderId =
    orderEntity?.receipt ??
    orderEntity?.notes?.merchantOrderId ??
    paymentEntity?.notes?.merchantOrderId;

  logger.info("webhook.received", {
    event,
    merchantOrderId,
    paymentStatus: paymentEntity?.status,
  });

  switch (event) {
    case "payment.captured":
      return handleOrderCompleted({
        merchantOrderId,
        transactionId: paymentEntity?.id ?? null,
      });

    case "payment.failed":
      return handleOrderFailed({ merchantOrderId });

    default:
      logger.info("webhook.ignoredEvent", { event });
      return successResponse({ received: true });
  }
}

// ─── payment.captured ────────────────────────────────────────────────────────
// Delegates to the shared completeOrder() function (lib/server/payments/
// complete-order.ts), which also backs the dev-only simulate-payment route.
// This keeps guest-account creation, enrollment, and email-sending logic in
// exactly one place.

async function handleOrderCompleted(payload: {
  merchantOrderId: string | undefined;
  transactionId: string | null;
}) {
  const { merchantOrderId, transactionId } = payload;

  if (!merchantOrderId) {
    logger.error("webhook.completed.missingOrderId");
    return errorResponse("Missing merchantOrderId", 400);
  }

  const result = await completeOrder({ merchantOrderId, transactionId });

  if (!result.ok) {
    return errorResponse(result.error, result.status);
  }

  if (result.alreadyProcessed) {
    return successResponse({ received: true, alreadyProcessed: true });
  }

  return successResponse({ received: true });
}

// ─── payment.failed ──────────────────────────────────────────────────────────

async function handleOrderFailed(payload: {
  merchantOrderId: string | undefined;
}) {
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