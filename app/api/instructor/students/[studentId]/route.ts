import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { guardApiRole } from "@/lib/server/auth-guard"
import { prisma } from "@/lib/server/db"

// GET /api/instructor/students/[studentId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { studentId } = await params

  try {
    // Get instructor's courses
    const instructorCourses = await prisma.course.findMany({
      where: { instructorId: session.user.id },
      select: { id: true, title: true, thumbnail: true },
    })

    if (instructorCourses.length === 0) {
      return NextResponse.json({ error: "No courses found" }, { status: 404 })
    }

    const courseIds = instructorCourses.map((c) => c.id)
    const courseMap = Object.fromEntries(instructorCourses.map((c) => [c.id, c]))

    // Get student info
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, image: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get enrollments only in instructor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        courseId: { in: courseIds },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            sections: {
              select: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    })

    const courses = enrollments.map((e) => {
      const totalLessons = e.course.sections.reduce(
        (sum, s) => sum + s.lessons.length,
        0
      )
      const lessonsCompleted = Math.round(
        (e.progress / 100) * totalLessons
      )

      return {
        courseId: e.course.id,
        courseName: e.course.title,
        courseThumbnail: e.course.thumbnail,
        progressPercent: e.progress,
        lessonsCompleted,
        totalLessons,
        quizResults: [], // Placeholder — no quiz result tracking model yet
        lastActiveAt: e.lastActivity?.toISOString() || null,
        enrolledAt: e.enrolledAt.toISOString(),
      }
    })

    // Build timeline from enrollments
    const timeline = enrollments.map((e) => ({
      type: "enrollment" as const,
      label: `Enrolled in ${courseMap[e.courseId]?.title || "Unknown Course"}`,
      occurredAt: e.enrolledAt.toISOString(),
    }))

    // Add completion events
    enrollments
      .filter((e) => e.completedAt)
      .forEach((e) => {
        timeline.push({
          type: "lesson_complete" as any,
          label: `Completed ${courseMap[e.courseId]?.title || "Unknown Course"}`,
          occurredAt: e.completedAt!.toISOString(),
        })
      })

    // Sort timeline by most recent
    timeline.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    )

    return NextResponse.json({
      student,
      courses,
      timeline,
    })
  } catch (error) {
    console.error("Instructor student detail error:", error)
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    )
  }
}
