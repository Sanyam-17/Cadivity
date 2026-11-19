import "server-only";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { logger } from "./logger";

// ─── Razorpay Client ─────────────────────────────────────────────────────────
// Single shared instance. Test-mode vs live-mode is controlled entirely by
// which key_id / key_secret pair is supplied via env — Razorpay test keys are
// prefixed "rzp_test_" and live keys "rzp_live_".

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

// ─── Strict Types ────────────────────────────────────────────────────────────

export interface CreateOrderParams {
  merchantOrderId: string;
  amount: number; // in paise
  redirectUrl: string;
}

export interface CreateOrderResult {
  razorpayOrderId: string;
  redirectUrl: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface OrderStatusResult {
  state: string; // "COMPLETED" | "FAILED" | "PENDING" etc.
  razorpayOrderId: string;
  transactionId: string | null;
}

// ─── Create Order ────────────────────────────────────────────────────────────
// Creates a Razorpay Order. Unlike PhonePe's hosted checkout, Razorpay's
// Standard Checkout is a client-side JS widget (Checkout.js), so there is no
// server-generated redirectUrl to a hosted page — we return the order details
// needed by the frontend to open Razorpay Checkout, plus the redirectUrl the
// frontend should send the browser to after the widget's callback fires.

export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  logger.info("razorpay.createOrder", {
    merchantOrderId: params.merchantOrderId,
    amount: params.amount,
  });

  try {
    const order = await razorpay.orders.create({
      amount: params.amount, // paise
      currency: "INR",
      receipt: params.merchantOrderId,
      notes: {
        merchantOrderId: params.merchantOrderId,
        redirectUrl: params.redirectUrl,
      },
    });

    logger.info("razorpay.createOrder.response", {
      merchantOrderId: params.merchantOrderId,
      razorpayOrderId: order.id,
    });

    return {
      razorpayOrderId: order.id,
      redirectUrl: params.redirectUrl,
      amount: params.amount,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    logger.error("razorpay.createOrder.error", {
      error: error instanceof Error ? error.message : String(error),
      merchantOrderId: params.merchantOrderId,
    });
    throw new Error(
      `Razorpay createOrder failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─── Get Order Status ────────────────────────────────────────────────────────
// Calls Razorpay Orders API to verify the actual payment state server-side.
// Never trust the client callback alone.

export async function getOrderStatus(
  razorpayOrderId: string
): Promise<OrderStatusResult> {
  logger.info("razorpay.getOrderStatus", { razorpayOrderId });

  try {
    const order = await razorpay.orders.fetch(razorpayOrderId);

    const payments = await razorpay.orders.fetchPayments(order.id);
    const capturedPayment = payments.items?.find((p) => p.status === "captured");
    const failedPayment = payments.items?.find((p) => p.status === "failed");

    let state = "PENDING";
    if (order.status === "paid" || capturedPayment) {
      state = "COMPLETED";
    } else if (failedPayment && !capturedPayment) {
      state = "FAILED";
    }

    logger.info("razorpay.getOrderStatus.result", { razorpayOrderId, state });

    return {
      state,
      razorpayOrderId: order.id,
      transactionId: capturedPayment?.id ?? null,
    };
  } catch (error) {
    logger.error("razorpay.getOrderStatus.error", {
      error: error instanceof Error ? error.message : String(error),
      razorpayOrderId,
    });
    throw new Error(
      `Razorpay getOrderStatus failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─── Payment Signature Verification (client checkout callback) ──────────────
// After Razorpay Checkout.js completes, the browser posts back
// razorpay_order_id + razorpay_payment_id + razorpay_signature. Verify with
// HMAC-SHA256 over `${order_id}|${payment_id}` using the key secret.

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  try {
    const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(razorpaySignature, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (error) {
    logger.error("razorpay.paymentSignatureError", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// ─── Webhook Signature Verification ──────────────────────────────────────────
// Razorpay sends an X-Razorpay-Signature header computed as HMAC-SHA256 of the
// raw request body using RAZORPAY_WEBHOOK_SECRET. Verify with constant-time
// comparison.

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  try {
    const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(signatureHeader, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (error) {
    logger.error("razorpay.webhook.signatureError", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}