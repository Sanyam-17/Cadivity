import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { guardApiRole } from "@/lib/server/auth-guard";
import { errorResponse, successResponse } from "@/lib/server/api-utils";
import { logger } from "@/lib/server/logger";
import { z } from "zod";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;

    const guarded = await guardApiRole("student");
    if (guarded.error) return guarded.error;
    const session = guarded.session;

    const comment = await prisma.lessonComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only author or admin can delete
    if (comment.authorId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.lessonComment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    return successResponse({ success: true });
  } catch (error) {
    logger.error("Failed to delete comment", { error: String(error) });
    return errorResponse("Failed to delete comment", 500);
  }
}

const patchSchema = z.object({
  isInstructorAnswer: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;

    // Must be instructor or admin to update these flags
    const guarded = await guardApiRole("instructor");
    if (guarded.error) return guarded.error;
    const session = guarded.session;

    const body = await request.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (parsed.data.isInstructorAnswer !== undefined) {
      updates.isInstructorAnswer = parsed.data.isInstructorAnswer;
    }

    if (parsed.data.isPinned !== undefined) {
      // Only admin can pin
      if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Only admins can pin comments" }, { status: 403 });
      }
      updates.isPinned = parsed.data.isPinned;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    const comment = await prisma.lessonComment.update({
      where: { id: commentId },
      data: updates,
    });

    return successResponse(comment);
  } catch (error) {
    logger.error("Failed to patch comment", { error: String(error) });
    return errorResponse("Failed to patch comment", 500);
  }
}
