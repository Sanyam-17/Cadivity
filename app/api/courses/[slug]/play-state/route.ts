import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiExactRole } from "@/lib/server/auth-guard"
import { errorResponse } from "@/lib/server/api-utils"
import { resolveLessonYoutubeVideoId } from "@/lib/youtube"
import { logger } from "@/lib/server/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    // 1. Authenticate student FIRST — avoid DB work for unauthenticated requests
    const guarded = await guardApiExactRole("student")
    if (guarded.error) return guarded.error
    const session = guarded.session

    // 2. Get Course and Curriculum (content excluded — fetched per-lesson when active)
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                order: true,
                youtubeVideoId: true,
                // content intentionally excluded — may contain quiz answers
              },
            },
          },
        },
      },
    })

    if (!course) {
      return errorResponse("Course not found", 404)
    }

    // 3. Verify Enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
    })

    if (!enrollment) {
      return errorResponse("You are not enrolled in this course", 403)
    }

    // 4. Fetch completions
    const completions = await prisma.lessonCompletion.findMany({
      where: {
        studentId: session.user.id,
        lesson: {
          section: {
            courseId: course.id,
          },
        },
      },
      select: {
        lessonId: true,
      },
    })

    const completedLessonIds = completions.map((c) => c.lessonId)

    // 5. Flatten lessons to calculate sequential lock status
    const allLessons: Array<{ id: string; order: number }> = []
    course.sections.forEach((section) => {
      // Sort lessons inside sections
      const sortedLessons = [...section.lessons].sort((a, b) => a.order - b.order)
      allLessons.push(...sortedLessons)
    })

    const completedSet = new Set(completedLessonIds)
    const unlockedLessonIds = new Set<string>()

    // Unlocking rules:
    // First lesson is always unlocked.
    // Subsequent lessons are unlocked if completed OR if the preceding lesson in order is completed.
    allLessons.forEach((lesson, index) => {
      if (index === 0) {
        unlockedLessonIds.add(lesson.id)
      } else {
        const precedingLesson = allLessons[index - 1]
        const isPrecedingCompleted = completedSet.has(precedingLesson.id)
        const isCurrentCompleted = completedSet.has(lesson.id)

        if (isCurrentCompleted || isPrecedingCompleted) {
          unlockedLessonIds.add(lesson.id)
        }
      }
    })

    // 6. Map course curriculum with lock statuses
    const curriculum = course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      order: section.order,
      lessons: section.lessons
        .sort((a, b) => a.order - b.order)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          duration: lesson.duration,
          youtubeVideoId: lesson.youtubeVideoId,
          order: lesson.order,
          isCompleted: completedSet.has(lesson.id),
          isLocked: !unlockedLessonIds.has(lesson.id),
        })),
    }))

    // Return active play state
    return NextResponse.json({
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          logo: course.logo,
        },
        enrollment: {
          id: enrollment.id,
          progress: enrollment.progress,
          currentLessonId: enrollment.currentLessonId,
        },
        completedLessonIds,
        curriculum,
      },
    })
  } catch (error) {
    logger.error("play-state.fetch.failed", { slug, error: String(error) })
    return errorResponse("Failed to load course play-state", 500)
  }
}

