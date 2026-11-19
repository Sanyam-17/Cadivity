import arcjet from "@/lib/server/arcjet";
import { auth } from "@/lib/server/auth";
import ip from "@arcjet/ip";
import {
  type ArcjetDecision,
  type BotOptions,
  type EmailOptions,
  type ProtectSignupOptions,
  type SlidingWindowRateLimitOptions,
  detectBot,
  protectSignup,
  slidingWindow,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";
import { logger } from "@/lib/server/logger";

const emailOptions = {
  mode: "LIVE",
  deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

const botOptions = {
  mode: "LIVE",
  allow: [],
} satisfies BotOptions;

const signupRateLimitOptions = {
  mode: "LIVE",
  interval: "2m",
  max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

// Sign-in gets its own budget — this is the endpoint brute-force attempts
// actually target, so it shouldn't share a bucket with anything else.
const signInRateLimitOptions = {
  mode: "LIVE",
  interval: "60s",
  max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

const signupOptions = {
  email: emailOptions,
  bots: botOptions,
  rateLimit: signupRateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

async function protect(req: NextRequest): Promise<ArcjetDecision> {
  const { pathname } = req.nextUrl;

  // GET traffic (session checks, OAuth callback landings) just needs
  // bot-detection — skip the extra getSession() call and fingerprint by IP,
  // since these tend to be the highest-frequency requests in the app.
  if (req.method === "GET") {
    return arcjet
      .withRule(detectBot(botOptions))
      .protect(req, { fingerprint: ip(req) || "127.0.0.1" });
  }

  const session = await auth.api.getSession({ headers: req.headers });
  let userId: string;
  if (session?.user.id) {
    userId = session.user.id;
  } else {
    userId = ip(req) || "127.0.0.1";
  }

  if (pathname.startsWith("/api/auth/sign-up")) {
    const body = await req.clone().json().catch(() => null);

    if (typeof body?.email === "string") {
      return arcjet
        .withRule(protectSignup(signupOptions))
        .withRule(slidingWindow(signupRateLimitOptions))
        .protect(req, { email: body.email, fingerprint: userId });
    }
    return arcjet.withRule(detectBot(botOptions)).protect(req, { fingerprint: userId });
  }

  if (pathname.startsWith("/api/auth/sign-in")) {
    return arcjet
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(signInRateLimitOptions))
      .protect(req, { fingerprint: userId });
  }

  return arcjet.withRule(detectBot(botOptions)).protect(req, { fingerprint: userId });
}

const authHandler = toNextJsHandler(auth.handler);

async function handle(req: NextRequest) {
  const decision = await protect(req);

  logger.info("arcjet.decision", {
    path: req.nextUrl.pathname,
    method: req.method,
    denied: decision.isDenied(),
  });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return new Response(null, { status: 429 });
    }
    if (decision.reason.isEmail()) {
      let message: string;
      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "Email address format is invalid. Is there a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "We do not allow disposable email addresses.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message = "Your email domain does not have an MX record. Is there a typo?";
      } else {
        message = "Invalid email";
      }
      return Response.json({ message }, { status: 400 });
    }
    return new Response(null, { status: 403 });
  }

  return req.method === "GET" ? authHandler.GET(req) : authHandler.POST(req);
}

export const GET = handle;
export const POST = handle;