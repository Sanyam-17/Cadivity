import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getUserRole, ROLES, type UserRole } from "./roles";

/** Numeric hierarchy — higher value = greater access. */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.STUDENT]: 0,
  [ROLES.INSTRUCTOR]: 1,
  [ROLES.ADMIN]: 2,
};

/**
 * Server-side auth guard — use in Server Components and API routes.
 * Returns the session or redirects to home.
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return session;
}

/**
 * Server-side role guard — redirects if the user doesn't have the required role.
 */
export async function requireRole(role: UserRole) {
  const session = await requireAuth();

  const userRole = getUserRole(session.user);

  // Allow access if the user's level is >= the required level (e.g. admin can
  // pass an instructor-gated route).
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[role]) {
    if (userRole === ROLES.ADMIN) redirect("/admin");
    redirect(`/dashboard/${userRole}`);
  }

  return session;
}

/**
 * Admin-only guard.
 */
export async function requireAdmin() {
  return requireRole("admin");
}

/**
 * Guard for instructor OR admin.
 * Used for content management (modules, lessons, quizzes, assignments).
 */
export async function requireInstructorOrAdmin() {
  const session = await requireAuth();
  const role = getUserRole(session.user);

  // Requires at least instructor-level access.
  if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[ROLES.INSTRUCTOR]) {
    redirect(`/dashboard/${role}`);
  }

  return session;
}

/**
 * Get current session without redirecting (returns null if not authenticated).
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}
