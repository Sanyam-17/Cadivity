import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/server/db"

// GET /api/instructor/courses/[courseId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Calculate completion rate
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { progress: true },
    })
    const completionRate =
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
              enrollments.length
          )
        : 0

    return NextResponse.json({
      id: course.id,
      title: course.title,
      description: course.description,
      slug: course.slug,
      thumbnail: course.thumbnail,
      status: course.status,
      category: course.category,
      completionCriteria: course.completionCriteria,
      seoTitle: course.seoTitle,
      seoDescription: course.seoDescription,
      enrolledCount: course._count.enrollments,
      completionRate,
      updatedAt: course.updatedAt.toISOString(),
      instructor: course.instructor,
    })
  } catch (error) {
    console.error("Course detail error:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}

// PATCH /api/instructor/courses/[courseId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId } = await params

  try {
    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { status, completionCriteria, seoTitle, seoDescription } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (completionCriteria !== undefined) updateData.completionCriteria = completionCriteria
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    })

    return NextResponse.json({ success: true, updatedAt: updated.updatedAt.toISOString() })
  } catch (error) {
    console.error("Course update error:", error)
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    )
  }
}
