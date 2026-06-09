import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { guardApiRole } from "@/lib/server/auth-guard";
import { errorResponse, handleApiError, parsePagination, successResponse } from "@/lib/server/api-utils";

export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("admin");
  if (guarded.error) return guarded.error;

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams, { page: 1, pageSize: 25 });

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.auditLog.count(),
    ]);

    return successResponse({
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
