import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import {
  guardApiRole,
  canManageCourse,
  requireSectionInCourse,
  getRequestIp,
} from "@/lib/server/auth-guard"
import { instructorLessonCreateSchema } from "@/lib/server/validators/users"
import { withRateLimit } from "@/lib/server/arcjet"
import { errorResponse } from "@/lib/server/api-utils"

const aj = withRateLimit(40, 60);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId, sectionId } = await params

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many requests", 429)
    }

    if (!(await canManageCourse(courseId, session))) {
      return errorResponse("Forbidden", 403)
    }

    if (!(await requireSectionInCourse(sectionId, courseId))) {
      return errorResponse("Section not found in course", 400)
    }

    const body = await request.json().catch(() => ({}))
    const parsed = instructorLessonCreateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse("Invalid payload", 400, parsed.error.flatten())
    }

    const { title, type } = parsed.data

    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
    })
    const newOrder = lastLesson ? lastLesson.order + 1 : 0

    const lesson = await prisma.lesson.create({
      data: {
        title,
        type,
        sectionId,
        order: newOrder,
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Create lesson error:", error)
    return errorResponse("Failed to create lesson", 500)
  }
}
