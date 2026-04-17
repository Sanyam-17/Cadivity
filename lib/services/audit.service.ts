import { prisma } from "@/lib/db";

interface LogAdminActionParams {
  adminId: string;
  action: string;
  targetId: string;
  meta?: string;
}

/**
 * Writes an immutable audit log entry for any admin action.
 * Fire-and-forget safe — errors are swallowed so they never
 * break the primary request path.
 */
export async function logAdminAction({
  adminId,
  action,
  targetId,
  meta,
}: LogAdminActionParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { adminId, action, targetId, meta },
    });
  } catch (err) {
    // Log to server console but don't surface to caller
    console.error("[AuditLog] Failed to write audit entry:", err);
  }
}
