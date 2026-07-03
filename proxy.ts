import { NextRequest, NextResponse } from "next/server";
import { getCookieCache, getSessionCookie } from "better-auth/cookies";
import { getUserRole, type UserRole } from "./lib/roles";
import {
  classifyRoute,
  isApiRoute,
  isAuthorized,
  buildLoginRedirectPath,
  getDashboardForRole,
} from "./lib/proxy/helpers";

// ---------------------------------------------------------------------------
// Response Helpers
// ---------------------------------------------------------------------------

/**
 * Set cache-control headers that prevent browsers and CDNs from caching
 * auth-gated redirect/error responses.
 *
 * We intentionally do NOT apply these to `NextResponse.next()` because
 * downstream pages/APIs may have their own caching strategies.
 */
function noCacheRedirect(url: URL): NextResponse {
  const res = NextResponse.redirect(url);
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

function jsonError(
  message: string,
  status: 401 | 403,
): NextResponse {
  const res = NextResponse.json({ error: message }, { status });
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  return res;
}

// ---------------------------------------------------------------------------
// Session Resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the user's role from the request cookies.
 *
 * Strategy (two-tier):
 *
 * 1. **Primary — `getCookieCache()`**
 *    Reads the `better-auth.session_data` cookie and verifies its
 *    HMAC-SHA256 signature using `BETTER_AUTH_SECRET`. Returns the full
 *    session + user object (including `role`) with zero network or DB calls.
 *    Runs in ~1–2ms.
 *
 * 2. **Fallback — `getSessionCookie()`**
 *    If the cookie cache hasn't been issued yet (e.g. the first request
 *    immediately after login, before `getSession()` refreshes the cache),
 *    we check for the raw `session_token` cookie. Its presence proves the
 *    user authenticated, but we don't know their role — so we allow the
 *    request through and let the Server Component's `requireRole()` do the
 *    authoritative check.
 *
 * Returns:
 *   - `{ authenticated: true,  role: UserRole }` — cookie cache verified
 *   - `{ authenticated: true,  role: null }`      — session token present but no cache
 *   - `{ authenticated: false, role: null }`       — no session at all
 */
type SessionResult =
  | { authenticated: true; role: UserRole }
  | { authenticated: true; role: null }
  | { authenticated: false; role: null };

async function resolveSession(request: NextRequest): Promise<SessionResult> {
  // Tier 1: Try cryptographically-verified cookie cache
  try {
    const cached = await getCookieCache(request);
    if (cached?.user) {
      return {
        authenticated: true,
        role: getUserRole(cached.user),
      };
    }
  } catch {
    // Cookie cache verification failed (tampered, expired, missing secret).
    // Fall through to tier 2.
  }

  // Tier 2: Check for raw session token (optimistic)
  const sessionToken = getSessionCookie(request);
  if (sessionToken) {
    return { authenticated: true, role: null };
  }

  return { authenticated: false, role: null };
}

// ---------------------------------------------------------------------------
// Proxy Entry Point
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ── Root /dashboard redirect ──────────────────────────────────────────
  // Authenticated users hitting `/dashboard` or `/dashboard/` should be
  // redirected to their role-specific dashboard. This runs before route
  // classification because `/dashboard` itself isn't a protected route —
  // it's a convenience redirect.
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const session = await resolveSession(request);

    if (!session.authenticated) {
      return noCacheRedirect(
        new URL(buildLoginRedirectPath(pathname, search), request.url),
      );
    }

    // If we know the role, redirect to the correct dashboard.
    // If role is unknown (tier-2 fallback), default to student dashboard
    // and let the Server Component re-evaluate.
    const role = session.role ?? "student";
    return noCacheRedirect(
      new URL(getDashboardForRole(role), request.url),
    );
  }

  // ── Route classification ──────────────────────────────────────────────
  const routeClass = classifyRoute(pathname);

  // If the matcher let through a route we don't classify, pass through.
  // This should never happen with a correct config.matcher.
  if (!routeClass) {
    return NextResponse.next();
  }

  const isApi = isApiRoute(routeClass);

  // ── Authentication check ──────────────────────────────────────────────
  const session = await resolveSession(request);

  if (!session.authenticated) {
    if (isApi) {
      return jsonError("Unauthorized", 401);
    }
    return noCacheRedirect(
      new URL(buildLoginRedirectPath(pathname, search), request.url),
    );
  }

  // ── Authorization check ───────────────────────────────────────────────
  // If we have the role from the verified cookie cache, enforce it.
  // If role is null (tier-2 fallback: session token exists but no cache),
  // we allow the request through — the Server Component's `requireRole()`
  // will perform the authoritative database-backed check.
  if (session.role !== null) {
    if (!isAuthorized(session.role, routeClass)) {
      if (isApi) {
        return jsonError("Forbidden", 403);
      }
      return noCacheRedirect(
        new URL(getDashboardForRole(session.role), request.url),
      );
    }
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Route Matcher
// ---------------------------------------------------------------------------

/**
 * Only run the proxy for routes that require auth/role checks.
 *
 * This keeps the proxy off public pages, static assets, and the
 * better-auth API routes (`/api/auth/*`), ensuring zero overhead
 * for unauthenticated browsing.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*/play",
    "/api/admin/:path*",
    "/api/instructor/:path*",
  ],
};