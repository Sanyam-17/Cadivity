import "server-only";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth, type Session } from "./auth";
import { getUserRole, ROLES, type UserRole } from "../roles";
import { prisma } from "./db";

/** Numeric hierarchy — higher value = greater access. */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.STUDENT]: 0,
  [ROLES.INSTRUCTOR]: 1,
  [ROLES.ADMIN]: 2,
};

export type ApiGuardResult =
  | { session: Session; error: null }
  | { session: null; error: NextResponse };

type GuardOptions = {
  requireActive?: boolean;
  requireEmailVerified?: boolean;
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
/** Minimum role (admin can access instructor-gated pages). */
export async function requireRole(role: UserRole) {
  const session = await requireAuth();

  const userRole = getUserRole(session.user);

  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[role]) {
    redirect(`/dashboard/${userRole}`);
  }

  return session;
}

/** Exact role match — use for student-only surfaces. */
export async function requireExactRole(role: UserRole) {
  const session = await requireAuth();
  const userRole = getUserRole(session.user);

  if (userRole !== role) {
    redirect(`/dashboard/${userRole}`);
  }

  return session;
}

/** User must have one of the listed roles (no hierarchy). */
export async function requireRoleIn(allowed: UserRole[]) {
  const session = await requireAuth();
  const userRole = getUserRole(session.user);

  if (!allowed.includes(userRole)) {
    redirect(`/dashboard/${userRole}`);
  }

  return session;
}

export async function requireAdmin() {
  return requireExactRole("admin");
}

export async function requireInstructorOrAdmin() {
  return requireRoleIn([ROLES.INSTRUCTOR, ROLES.ADMIN]);
}

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

export async function requireApiSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session ?? null;
}

export async function requireApiRole(minRole: UserRole) {
  const session = await requireApiSession();
  if (!session) return null;

  const userRole = getUserRole(session.user);
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
    return null;
  }

  return session;
}

/**
 * API guard with standardized JSON errors. Admin satisfies instructor/student gates.
 */
export async function guardApiRole(
  minRole: UserRole,
  options: GuardOptions = { requireActive: true }
): Promise<ApiGuardResult> {
  const session = await requireApiSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  const userRole = getUserRole(session.user);
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  if (options.requireActive !== false) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { active: true, emailVerified: true },
    });

    if (!user?.active) {
      return {
        session: null,
        error: NextResponse.json({ success: false, error: "Account is inactive" }, { status: 403 }),
      };
    }

    if (options.requireEmailVerified && !user.emailVerified) {
      return {
        session: null,
        error: NextResponse.json(
          { success: false, error: "Email verification required" },
          { status: 403 }
        ),
      };
    }
  }

  return { session, error: null };
}

/** Exact role for student-only learning/enrollment APIs. */
export async function guardApiExactRole(
  role: UserRole,
  options: GuardOptions = { requireActive: true }
): Promise<ApiGuardResult> {
  const session = await requireApiSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (getUserRole(session.user) !== role) {
    return {
      session: null,
      error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  if (options.requireActive !== false) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { active: true, emailVerified: true },
    });

    if (!user?.active) {
      return {
        session: null,
        error: NextResponse.json({ success: false, error: "Account is inactive" }, { status: 403 }),
      };
    }

    if (options.requireEmailVerified && !user.emailVerified) {
      return {
        session: null,
        error: NextResponse.json(
          { success: false, error: "Email verification required" },
          { status: 403 }
        ),
      };
    }
  }

  return { session, error: null };
}

export function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export async function requireInstructorCourseAccess(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  return !!course && course.instructorId === userId;
}

/** Admin may manage any course; instructors only their own. */
export async function canManageCourse(courseId: string, session: Session): Promise<boolean> {
  if (getUserRole(session.user) === ROLES.ADMIN) {
    return true;
  }
  return requireInstructorCourseAccess(courseId, session.user.id);
}

export async function requireSectionInCourse(sectionId: string, courseId: string) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, courseId },
    select: { id: true },
  });
  return !!section;
}

export async function requireLessonInSectionCourse(
  lessonId: string,
  sectionId: string,
  courseId: string
) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      sectionId,
      section: { courseId },
    },
    select: { id: true },
  });
  return !!lesson;
}
