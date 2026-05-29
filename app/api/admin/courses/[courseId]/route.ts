import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { logAdminAction } from "@/lib/services/audit.service"

// GET /api/admin/courses/[courseId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params

  try {
    const body = await request.json()
    const allowedFields = [
      "title", "slug", "description", "thumbnail", "status",
      "visibility", "completionCriteria", "seoTitle", "seoDescription",
      "instructorId", "categoryId",
    ]

    const data: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field]
      }
    }

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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
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
