import type { UserRole } from "../roles";

// ---------------------------------------------------------------------------
// Route Classification
// ---------------------------------------------------------------------------

/**
 * Every URL matched by the proxy falls into one of these categories.
 * "page" routes return HTML redirects; "api" routes return JSON errors.
 */
export type RouteClass =
  | "admin-page"
  | "instructor-page"
  | "student-page"
  | "player-page"
  | "admin-api"
  | "instructor-api";

// ---------------------------------------------------------------------------
// Role → Dashboard mapping
// ---------------------------------------------------------------------------

/** The default landing page for each role. */
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  instructor: "/dashboard/instructor",
  student: "/dashboard/student",
} as const;

// ---------------------------------------------------------------------------
// Route → Minimum Role mapping
// ---------------------------------------------------------------------------

/**
 * The minimum role required for each route class.
 *
 * - `"admin"`       → only admin
 * - `"instructor"`  → instructor OR admin  (hierarchy: admin ≥ instructor)
 * - `"any"`         → any authenticated user
 */
export const ROUTE_MIN_ROLE: Record<RouteClass, UserRole | "any"> = {
  "admin-page": "admin",
  "instructor-page": "instructor",
  "student-page": "any",     // spec: any authenticated user
  "player-page": "any",      // spec: any authenticated user
  "admin-api": "admin",
  "instructor-api": "instructor",
} as const;
