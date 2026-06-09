import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { z } from "zod"
import { withRateLimit } from "@/lib/server/arcjet"
import { guardApiExactRole, getRequestIp } from "@/lib/server/auth-guard"
import { errorResponse, successResponse } from "@/lib/server/api-utils"

const aj = withRateLimit(30, 60);

const enrollmentUpdateSchema = z.object({
  currentLessonId: z.string().min(1),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const { enrollmentId } = await params

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many requests", 429)
    }

    const guarded = await guardApiExactRole("student")
    if (guarded.error) return guarded.error
    const session = guarded.session

    const body = await request.json().catch(() => ({}))
    const parsed = enrollmentUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const { currentLessonId } = parsed.data

    // 1. Fetch enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment record not found" }, { status: 404 })
    }

    // 2. Security guard: Ensure student owns the enrollment
    if (enrollment.studentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Ensure current lesson belongs to the same course as enrollment.
    const lesson = await prisma.lesson.findUnique({
      where: { id: currentLessonId },
      select: {
        id: true,
        section: {
          select: {
            courseId: true,
          },
        },
      },
    })

    if (!lesson || lesson.section.courseId !== enrollment.courseId) {
      return NextResponse.json({ error: "Lesson is not part of this enrollment course" }, { status: 400 })
    }

    // 3. Update the enrollment
    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        currentLessonId,
      },
    })

    return NextResponse.json({
      data: {
        id: updated.id,
        currentLessonId: updated.currentLessonId,
        progress: updated.progress,
      },
    })
  } catch (error) {
    console.error("Enrollment update error:", error)
    return NextResponse.json(
      { error: "Failed to update enrollment progress" },
      { status: 500 }
    )
  }
}
