import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logAdminAction } from "@/lib/services/audit.service";
import { ROLES, isValidRole } from "@/lib/roles";

// PATCH /api/admin/users/[userId] — update role or active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const body = await request.json();
  const { role, active } = body;

  // ── Guard: admins cannot change their own role or status ───────────────────
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role or status" },
      { status: 403 }
    );
  }

  const data: any = {};
  
  // Handle Role Change
  if (role !== undefined) {
    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Guard: prevent removing the last admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (targetUser?.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: ROLES.ADMIN },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin" },
          { status: 403 }
        );
      }
    }
    data.role = role;
  }

  // Handle Active Status Change
  if (active !== undefined) {
    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "Invalid active status" }, { status: 400 });
    }
    data.active = active;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // Audit Logs
  if (role !== undefined) {
    await logAdminAction({
      adminId: session.user.id,
      action: "ROLE_CHANGE",
      targetId: userId,
      meta: JSON.stringify({ newRole: role }),
    });
  }
  
  if (active !== undefined) {
    await logAdminAction({
      adminId: session.user.id,
      action: active ? "USER_REACTIVATE" : "USER_DEACTIVATE",
      targetId: userId,
    });
  }

  return NextResponse.json(updatedUser);
}

// DELETE /api/admin/users/[userId] — hard delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 403 });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  await logAdminAction({
    adminId: session.user.id,
    action: "USER_DELETE",
    targetId: userId,
  });

  return NextResponse.json({ success: true });
}
