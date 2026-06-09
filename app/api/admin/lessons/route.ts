import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole, getRequestIp } from "@/lib/server/auth-guard"
import { logAdminAction } from "@/lib/services/audit.service"
import { createLessonSchema } from "@/lib/server/validators/common"
import { withRateLimit } from "@/lib/server/arcjet"
import { errorResponse } from "@/lib/server/api-utils"

const aj = withRateLimit(40, 60);
import { logger } from "@/lib/server/logger"

export async function POST(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many requests", 429)
    }

    const body = await request.json().catch(() => ({}))
    const parsed = createLessonSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse("Invalid payload", 400, parsed.error.flatten())
    }

    const { title, sectionId, type, youtubeVideoId, duration } = parsed.data

    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
    })

    const order = lastLesson ? lastLesson.order + 1 : 0

    const lesson = await prisma.lesson.create({
      data: {
        title,
        sectionId,
        type: type ?? "video",
        order,
        youtubeVideoId: youtubeVideoId ?? null,
        duration: duration ?? null,
      },
    })

    await logAdminAction({
      adminId: session.user.id,
      action: "LESSON_CREATE",
      targetId: lesson.id,
      meta: JSON.stringify({ sectionId, type: type ?? "video" }),
    })

    logger.info("admin.lesson.created", { adminId: session.user.id, lessonId: lesson.id })

    return NextResponse.json(lesson)
  } catch (error) {
    logger.error("admin.lesson.create.failed", { error: String(error) })
    return errorResponse("Failed to create lesson", 500)
  }
}
