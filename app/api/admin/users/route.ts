import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { guardApiRole } from "@/lib/server/auth-guard";
import { logAdminAction } from "@/lib/services/audit.service";
import { parsePagination, errorResponse } from "@/lib/server/api-utils";
import { adminUserRolePatchSchema } from "@/lib/server/validators/users";
import { isValidRole } from "@/lib/roles";
import { ROLES } from "@/lib/roles";

export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("admin");
  if (guarded.error) return guarded.error;

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = parsePagination(searchParams, { page: 1, pageSize: 50 });
  const role = searchParams.get("role");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (role) {
    if (!isValidRole(role)) {
      return errorResponse("Invalid role filter", 400);
    }
    where.role = role;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: users,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function PATCH(request: NextRequest) {
  const guarded = await guardApiRole("admin");
  if (guarded.error) return guarded.error;
  const session = guarded.session;

  const body = await request.json().catch(() => ({}));
  const parsed = adminUserRolePatchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Invalid payload", 400, parsed.error.flatten());
  }

  const { userId, role } = parsed.data;

  if (userId === session.user.id) {
    return errorResponse("You cannot change your own role", 403);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (targetUser?.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: ROLES.ADMIN },
    });
    if (adminCount <= 1) {
      return errorResponse("Cannot remove the last admin", 403);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
  });

  await logAdminAction({
    adminId: session.user.id,
    action: "ROLE_CHANGE",
    targetId: userId,
    meta: JSON.stringify({ newRole: role }),
  });

  return NextResponse.json({ success: true, data: updatedUser });
}
