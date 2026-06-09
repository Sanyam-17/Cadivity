import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { z } from "zod"
import { withRateLimit } from "@/lib/server/arcjet"
import { guardApiExactRole, getRequestIp } from "@/lib/server/auth-guard"
import { errorResponse, successResponse } from "@/lib/server/api-utils"
import { logger } from "@/lib/server/logger"

const completionSchema = z.object({
  lessonId: z.string().min(1),
})

const aj = withRateLimit(60, 60);

export async function POST(request: NextRequest) {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many completion requests", 429)
    }

    const guarded = await guardApiExactRole("student")
    if (guarded.error) return guarded.error
    const session = guarded.session

    const body = await request.json().catch(() => ({}))
    const parsed = completionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const { lessonId } = parsed.data

    // 1. Fetch lesson & check existence
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: true,
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const courseId = lesson.section.courseId

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
      select: { id: true },
    })

    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 })
    }

    // 2. Mark lesson complete (Upsert to prevent duplicate conflicts)
    await prisma.lessonCompletion.upsert({
      where: {
        studentId_lessonId: {
          studentId: session.user.id,
          lessonId,
        },
      },
      create: {
        studentId: session.user.id,
        lessonId,
      },
      update: {},
    })

    // 3. Recalculate progress for this course
    const courseLessons = await prisma.lesson.findMany({
      where: {
        section: {
          courseId,
        },
      },
      select: {
        id: true,
      },
    })

    const totalLessons = courseLessons.length

    const completedCount = await prisma.lessonCompletion.count({
      where: {
        studentId: session.user.id,
        lesson: {
          section: {
            courseId,
          },
        },
      },
    })

    const progress = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0

    // 4. Update Enrollment progress
    const isCompleted = progress === 100

    await prisma.enrollment.update({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
      data: {
        progress,
        completedAt: isCompleted ? new Date() : undefined,
      },
    })

    // 5. Retrieve all completions to return to frontend
    const allCompletions = await prisma.lessonCompletion.findMany({
      where: {
        studentId: session.user.id,
        lesson: {
          section: {
            courseId,
          },
        },
      },
      select: {
        lessonId: true,
      },
    })

    const completedLessonIds = allCompletions.map((c) => c.lessonId)

    return NextResponse.json({
      data: {
        progress,
        completedLessonIds,
        isCompleted,
      },
    })

  } catch (error) {
    logger.error("lesson.completion.failed", { error: String(error) })
    return errorResponse("Failed to record lesson completion", 500)
  }
}
