import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import {
  guardApiRole,
  canManageCourse,
  requireLessonInSectionCourse,
  getRequestIp,
} from "@/lib/server/auth-guard"
import { lessonPatchSchema } from "@/lib/server/validators/course"
import { withRateLimit } from "@/lib/server/arcjet"
import { errorResponse } from "@/lib/server/api-utils"

const aj = withRateLimit(60, 60);
import { extractYouTubeVideoId } from "@/lib/youtube"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string; lessonId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId, sectionId, lessonId } = await params

  try {
    if (!(await canManageCourse(courseId, session))) {
      return errorResponse("Forbidden", 403)
    }

    if (!(await requireLessonInSectionCourse(lessonId, sectionId, courseId))) {
      return errorResponse("Lesson does not belong to this section/course", 400)
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    })

    if (!lesson) {
      return errorResponse("Lesson not found", 404)
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Fetch lesson error:", error)
    return errorResponse("Failed to fetch lesson", 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string; lessonId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId, sectionId, lessonId } = await params

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many requests", 429)
    }

    if (!(await canManageCourse(courseId, session))) {
      return errorResponse("Forbidden", 403)
    }

    if (!(await requireLessonInSectionCourse(lessonId, sectionId, courseId))) {
      return errorResponse("Lesson does not belong to this section/course", 400)
    }

    const body = await request.json().catch(() => ({}))
    const parsed = lessonPatchSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse("Invalid payload", 400, parsed.error.flatten())
    }

    const { content, ...rest } = parsed.data

    let youtubeVideoIdSync: string | null | undefined
    if (content !== undefined && content !== null && typeof content === "object") {
      const videoUrl = (content as { videoUrl?: string }).videoUrl
      if (videoUrl?.trim()) {
        youtubeVideoIdSync = extractYouTubeVideoId(videoUrl)
      } else if ("videoUrl" in content) {
        youtubeVideoIdSync = null
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...rest,
        ...(content !== undefined ? { content: content as object } : {}),
        ...(youtubeVideoIdSync !== undefined
          ? { youtubeVideoId: youtubeVideoIdSync }
          : {}),
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Update lesson error:", error)
    return errorResponse("Failed to update lesson", 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string; lessonId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId, sectionId, lessonId } = await params

  try {
    if (!(await canManageCourse(courseId, session))) {
      return errorResponse("Forbidden", 403)
    }

    if (!(await requireLessonInSectionCourse(lessonId, sectionId, courseId))) {
      return errorResponse("Lesson does not belong to this section/course", 400)
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete lesson error:", error)
    return errorResponse("Failed to delete lesson", 500)
  }
}
