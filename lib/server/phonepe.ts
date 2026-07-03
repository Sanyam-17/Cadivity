import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { logger } from "./logger";

// ─── Base URL ────────────────────────────────────────────────────────────────
// Derived from PHONEPE_ENV — never hardcoded elsewhere.

function getBaseUrl(): string {
  return env.PHONEPE_ENV === "production"
    ? "https://api.phonepe.com"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";
}

// ─── OAuth2 Token Manager ────────────────────────────────────────────────────
// Fetches an access_token via client_credentials grant. Caches in-memory and
// auto-refreshes 60 seconds before expiry. Only this module calls the OAuth
// endpoint — no other file should.

interface CachedToken {
  accessToken: string;
  expiresAt: number; // Unix epoch seconds
}

let cachedToken: CachedToken | null = null;

function isTokenValid(): boolean {
  if (!cachedToken) return false;
  // Refresh 60 seconds before actual expiry
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds < cachedToken.expiresAt - 60;
}

async function fetchNewToken(): Promise<CachedToken> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/v1/oauth/token`;

  const body = new URLSearchParams({
    client_id: env.PHONEPE_CLIENT_ID,
    client_secret: env.PHONEPE_CLIENT_SECRET,
    client_version: env.PHONEPE_CLIENT_VERSION,
    grant_type: "client_credentials",
  });

  logger.info("phonepe.token.fetch", { url });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    logger.error("phonepe.token.error", {
      status: response.status,
      body: errorText,
    });
    throw new Error(
      `PhonePe OAuth token fetch failed: ${response.status} ${errorText}`
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_at: number; // epoch seconds
    token_type: string;
  };

  const token: CachedToken = {
    accessToken: data.access_token,
    expiresAt: data.expires_at,
  };

  cachedToken = token;

  logger.info("phonepe.token.cached", {
    expiresAt: new Date(token.expiresAt * 1000).toISOString(),
  });

  return token;
}

async function getAccessToken(): Promise<string> {
  if (isTokenValid()) {
    return cachedToken!.accessToken;
  }
  const token = await fetchNewToken();
  return token.accessToken;
}

// ─── Strict Types ────────────────────────────────────────────────────────────

export interface CreateOrderParams {
  merchantOrderId: string;
  amount: number; // in paise
  redirectUrl: string;
}

export interface CreateOrderResult {
  phonepeOrderId: string;
  redirectUrl: string;
}

export interface OrderStatusResult {
  state: string; // "COMPLETED" | "FAILED" | "PENDING" etc.
  phonepeOrderId: string;
  transactionId: string | null;
}

// ─── Create Order ────────────────────────────────────────────────────────────
// Calls PhonePe Initiate Payment API (Standard Checkout).
// Returns the PhonePe order ID and the redirect URL for the hosted checkout.

export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/checkout/v2/pay`;
  const token = await getAccessToken();

  const payload = {
    merchantOrderId: params.merchantOrderId,
    amount: params.amount,
    expireAfter: 1200, // 20 minutes
    redirectUrl: params.redirectUrl,
    redirectMode: "REDIRECT",
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: "Payment for Cadivity course",
    },
  };

  logger.info("phonepe.createOrder", {
    merchantOrderId: params.merchantOrderId,
    amount: params.amount,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    logger.error("phonepe.createOrder.error", {
      status: response.status,
      body: errorText,
      merchantOrderId: params.merchantOrderId,
    });
    throw new Error(
      `PhonePe createOrder failed: ${response.status} ${errorText}`
    );
  }

  const data = await response.json() as any;

  logger.info("phonepe.createOrder.response", {
    merchantOrderId: params.merchantOrderId,
    responseData: JSON.stringify(data),
  });

  const orderId = data.orderId || data.data?.merchantTransactionId || data.data?.orderId || params.merchantOrderId;
  const redirectUrl = data.redirectUrl || data.instrumentResponse?.redirectInfo?.url || data.data?.instrumentResponse?.redirectInfo?.url || data.data?.redirectUrl;

  if (!redirectUrl) {
    logger.error("phonepe.createOrder.missingRedirectUrl", {
      merchantOrderId: params.merchantOrderId,
      data: JSON.stringify(data),
    });
    throw new Error("PhonePe response did not contain a redirectUrl");
  }

  return {
    phonepeOrderId: orderId,
    redirectUrl,
  };
}

// ─── Get Order Status ────────────────────────────────────────────────────────
// Calls PhonePe Order Status API to verify the actual payment state.
// Never trust the redirect alone — always verify server-side.

export async function getOrderStatus(
  merchantOrderId: string
): Promise<OrderStatusResult> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status`;
  const token = await getAccessToken();

  logger.info("phonepe.getOrderStatus", { merchantOrderId });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    logger.error("phonepe.getOrderStatus.error", {
      status: response.status,
      body: errorText,
      merchantOrderId,
    });
    throw new Error(
      `PhonePe getOrderStatus failed: ${response.status} ${errorText}`
    );
  }

  const data = (await response.json()) as {
    orderId: string;
    state: string;
    paymentDetails?: Array<{
      transactionId?: string;
    }>;
  };

  logger.info("phonepe.getOrderStatus.result", {
    merchantOrderId,
    state: data.state,
  });

  return {
    state: data.state,
    phonepeOrderId: data.orderId,
    transactionId: data.paymentDetails?.[0]?.transactionId ?? null,
  };
}

// ─── Webhook Signature Verification ──────────────────────────────────────────
// PhonePe sends a signature header computed as HMAC-SHA256 of the raw request
// body using PHONEPE_WEBHOOK_SECRET. We verify using constant-time comparison.

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  try {
    const expected = createHmac("sha256", env.PHONEPE_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(signatureHeader, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (error) {
    logger.error("phonepe.webhook.signatureError", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
