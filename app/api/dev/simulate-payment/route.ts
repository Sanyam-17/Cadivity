import { NextRequest, NextResponse } from "next/server";
import { completeOrder } from "@/lib/server/payments/complete-order";

// ─── Dev-only payment simulation ─────────────────────────────────────────────
// Bypasses the real Razorpay checkout + webhook so the checkout flow can be
// tested locally without a live transaction. Delegates to the same
// completeOrder() function the real webhook uses, so this now exercises the
// exact same path: idempotency check, guest account resolution/creation,
// enrollment creation, confirmation email, and sign-in OTP for new accounts.

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { orderId } = await request.json().catch(() => ({}));

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const result = await completeOrder({
    merchantOrderId: orderId,
    transactionId: `dev_sim_${Date.now()}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.alreadyProcessed) {
    return NextResponse.json({ success: true, alreadyProcessed: true });
  }

  return NextResponse.json({
    success: true,
    courseSlug: result.courseSlug,
    enrollmentId: result.enrollmentId,
    newAccountCreated: result.newAccountCreated,
  });
}