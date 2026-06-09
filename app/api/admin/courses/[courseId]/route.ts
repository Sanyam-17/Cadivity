import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { requireApiRole } from "@/lib/server/auth-guard"
import { logAdminAction } from "@/lib/services/audit.service"
import { updateCourseSchema } from "@/lib/server/validators/course"
import { withRateLimit } from "@/lib/server/arcjet"

const aj = withRateLimit(40, 60);

// GET /api/admin/courses/[courseId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await requireApiRole("admin")
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
          },
        },
        _count: { select: { enrollments: true } } as any,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...course,
      enrolledStudents: (course as any)._count?.enrollments ?? 0,
      sectionCount: course.sections.length,
      _count: undefined,
    })
  } catch (error) {
    console.error("Course detail error:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

// PATCH /api/admin/courses/[courseId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await requireApiRole("admin")
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = updateCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    const updated = await prisma.course.update({
      where: { id: courseId },
      data,
    })

    await logAdminAction({
      adminId: session.user.id,
      action: "COURSE_UPDATE",
      targetId: courseId,
      meta: JSON.stringify(Object.keys(data)),
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update course error:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

// DELETE /api/admin/courses/[courseId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await requireApiRole("admin")
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params

  try {
    await prisma.course.delete({ where: { id: courseId } })

    await logAdminAction({
      adminId: session.user.id,
      action: "COURSE_DELETE",
      targetId: courseId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete course error:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
