import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { requireApiSession } from "@/lib/server/auth-guard"
import { getUserRole, ROLES } from "@/lib/roles"
import { errorResponse, successResponse } from "@/lib/server/api-utils"

// GET /api/courses/[slug] — public endpoint to fetch course details & curriculum
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { slug },
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
      return errorResponse("Course not found", 404)
    }

    const session = await requireApiSession()
    const role = session ? getUserRole(session.user) : null
    const isAdmin = role === ROLES.ADMIN

    if (course.status !== "published" && !isAdmin) {
      return errorResponse("Course not available", 404)
    }

    let isEnrolled = false
    if (session?.user) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: course.id,
          },
        },
      })
      isEnrolled = !!enrollment
    }

    const response = successResponse({
      ...course,
      enrolledStudents: (course as any)._count?.enrollments ?? 0,
      sectionCount: course.sections.length,
      _count: undefined,
      isEnrolled,
    })

    if (course.status === "published") {
      response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120")
    }

    return response
  } catch (error) {
    console.error("Fetch course details error:", error)
    return errorResponse("Failed to fetch course details", 500)
  }
}
