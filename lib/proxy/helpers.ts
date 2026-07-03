import type { UserRole } from "../roles";
import type { RouteClass } from "./types";
import { ROUTE_MIN_ROLE, ROLE_DASHBOARD } from "./types";

// ---------------------------------------------------------------------------
// Role Hierarchy  (higher = more access)
// ---------------------------------------------------------------------------

const ROLE_LEVEL: Record<UserRole, number> = {
  student: 0,
  instructor: 1,
  admin: 2,
};

// ---------------------------------------------------------------------------
// Route Classifier















































// ---------------------------------------------------------------------------

/**
 * Classify a pathname into a `RouteClass`.
 *
 * Returns `null` for routes that don't require proxy-level protection
 * (should never happen if the config.matcher is correct, but we handle it
 * defensively).
 *
 * Order matters: more specific prefixes are tested first.
 */
export function classifyRoute(pathname: string): RouteClass | null {
  // --- API routes (check before page routes) ---
  if (pathname.startsWith("/api/admin"))      return "admin-api";
  if (pathname.startsWith("/api/instructor")) return "instructor-api";

  // --- Dashboard page routes ---
  if (pathname.startsWith("/dashboard/admin"))      return "admin-page";
  if (pathname.startsWith("/dashboard/instructor")) return "instructor-page";
  if (pathname.startsWith("/dashboard/student"))     return "student-page";

  // --- Player route: /courses/<slug>/play ---
  // Matches /courses/anything/play and /courses/anything/play/...
  if (/^\/courses\/[^/]+\/play(\/|$)/.test(pathname)) return "player-page";

  return null;
}

// ---------------------------------------------------------------------------
// Route Type Helpers
// ---------------------------------------------------------------------------

/** Returns true when the route class represents an API endpoint. */
export function isApiRoute(routeClass: RouteClass): boolean {
  return routeClass.endsWith("-api");
}

// ---------------------------------------------------------------------------
// Authorization
// ---------------------------------------------------------------------------

/**
 * Check whether `userRole` satisfies the minimum requirement for
 * `routeClass`.
 *
 * Uses a numeric hierarchy: admin(2) ≥ instructor(1) ≥ student(0).
 * When the minimum is `"any"`, every authenticated user passes.
 */
export function isAuthorized(
  userRole: UserRole,
  routeClass: RouteClass,
): boolean {
  const minRole = ROUTE_MIN_ROLE[routeClass];

  // Any authenticated user is allowed
  if (minRole === "any") return true;

  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole];
}

// ---------------------------------------------------------------------------
// URL Builders  (pure — no NextRequest dependency)
// ---------------------------------------------------------------------------

/**
 * Build a `/login?redirect=<original>` URL.
 *
 * Preserves both `pathname` and `search` so the user returns to exactly
 * where they were after signing in.
 */
export function buildLoginRedirectPath(
  pathname: string,
  search: string,
): string {
  const returnTo = pathname + search;
  return `/login?redirect=${encodeURIComponent(returnTo)}`;
}

/**
 * Return the dashboard path that corresponds to the user's role.
 * Used when a user tries to access a route they don't have permissions for.
 */
export function getDashboardForRole(role: UserRole): string {
  return ROLE_DASHBOARD[role];
}
