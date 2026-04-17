/**
 * Central role constants and utilities for the LMS.
 * Single source of truth for role strings used across the application.
 */

export const ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
} as const;

/** Union type derived from ROLES values — "admin" | "instructor" | "student" */
export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** Array of all valid role strings, useful for validation/iteration. */
export const VALID_ROLES: UserRole[] = [
  ROLES.ADMIN,
  ROLES.INSTRUCTOR,
  ROLES.STUDENT,
];

/**
 * Type guard — returns true if the value is a valid UserRole.
 */
export function isValidRole(role: unknown): role is UserRole {
  return typeof role === "string" && VALID_ROLES.includes(role as UserRole);
}

/**
 * Safely reads the role from a user object.
 * Falls back to ROLES.STUDENT if the role is missing or unrecognized.
 */
export function getUserRole(user: any): UserRole {
  const role = user?.role;
  return isValidRole(role) ? role : ROLES.STUDENT;
}
