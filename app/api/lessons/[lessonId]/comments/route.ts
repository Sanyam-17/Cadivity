import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { z } from "zod";
import { withRateLimit } from "@/lib/server/arcjet";
import { guardApiRole } from "@/lib/server/auth-guard";
import { getUserRole } from "@/lib/roles";
import { errorResponse, successResponse } from "@/lib/server/api-utils";
import { logger } from "@/lib/server/logger";

const aj = withRateLimit(10, 60);

// Basic HTML stripping helper
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, "").trim();
}

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    
    // Auth check - must be student or higher
    const guarded = await guardApiRole("student");
    if (guarded.error) return guarded.error;
    const session = guarded.session;

    // Verify the user is enrolled in the course this lesson belongs to
    // (instructors and admins can access any lesson's comments)
    const userRole = getUserRole(session.user);
    if (userRole === "student") {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { select: { courseId: true } } },
      });
      if (!lesson) return errorResponse("Lesson not found", 404);

      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: lesson.section.courseId,
          },
        },
      });
      if (!enrollment) return errorResponse("You are not enrolled in this course", 403);
    }

    const comments = await prisma.lessonComment.findMany({
      where: {
        lessonId,
        parentId: null, // Top-level only
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
        replies: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { isInstructorAnswer: "desc" },
        { createdAt: "desc" },
      ],
    });

    return successResponse(comments);
  } catch (error) {
    logger.error("Failed to fetch comments", { error: String(error) });
    return errorResponse("Failed to fetch comments", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many comment requests", 429);
    }

    const { lessonId } = await params;
    
    const guarded = await guardApiRole("student");
    if (guarded.error) return guarded.error;
    const session = guarded.session;

    const body = await request.json().catch(() => ({}));
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { content, parentId } = parsed.data;
    const sanitizedContent = stripHtml(content);

    if (!sanitizedContent) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    // Ensure lesson exists and verify enrollment for students
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { select: { courseId: true } } },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Students must be enrolled in the course to post comments
    const userRole = getUserRole(session.user);
    if (userRole === "student") {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: lesson.section.courseId,
          },
        },
      });
      if (!enrollment) return errorResponse("You are not enrolled in this course", 403);
    }

    // If it's a reply, verify parent exists and is top-level
    if (parentId) {
      const parent = await prisma.lessonComment.findUnique({
        where: { id: parentId },
      });
      if (!parent || parent.parentId) {
        return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 });
      }
    }

    // Is the author an instructor/admin?
    const isInstructorAnswer = ["instructor", "admin"].includes(session.user.role as string);

    const comment = await prisma.lessonComment.create({
      data: {
        content: sanitizedContent,
        lessonId,
        authorId: session.user.id,
        parentId: parentId || null,
        isInstructorAnswer, // Automatically flag if created by staff
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
      },
    });

    return successResponse(comment);
  } catch (error) {
    logger.error("Failed to create comment", { error: String(error) });
    return errorResponse("Failed to create comment", 500);
  }
}
