import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { guardApiRole } from "@/lib/server/auth-guard";
import { errorResponse, successResponse } from "@/lib/server/api-utils";
import { logger } from "@/lib/server/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Must be instructor or admin
    const guarded = await guardApiRole("instructor");
    if (guarded.error) return guarded.error;

    // Fetch comments for all lessons in this course
    const comments = await prisma.lessonComment.findMany({
      where: {
        lesson: {
          section: {
            courseId,
          },
        },
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(comments);
  } catch (error) {
    logger.error("Failed to fetch course comments", { error: String(error) });
    return errorResponse("Failed to fetch comments", 500);
  }
}
