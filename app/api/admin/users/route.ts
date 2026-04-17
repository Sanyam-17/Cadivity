import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logAdminAction } from "@/lib/services/audit.service";
import { ROLES } from "@/lib/roles";

// GET /api/admin/users — list all users (admin only)
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search");

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

// PATCH /api/admin/users — update user role (admin only)
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId, role } = body;

  if (!userId || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!Object.values(ROLES).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // ── Guard: admins cannot change their own role ─────────────────────────────
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 403 }
    );
  }

  // ── Guard: prevent removing the last admin ─────────────────────────────────
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

  // ── Perform update ─────────────────────────────────────────────────────────
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  // ── Audit log ──────────────────────────────────────────────────────────────
  await logAdminAction({
    adminId: session.user.id,
    action: "ROLE_CHANGE",
    targetId: userId,
    meta: JSON.stringify({ newRole: role }),
  });

  return NextResponse.json(updatedUser);
}
