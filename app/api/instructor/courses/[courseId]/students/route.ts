import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/server/db"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/courses/[courseId]/students
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
    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const result = await InstructorService.getStudents(session.user.id, {
      page,
      limit,
      courseId, // Force filter by this specific course
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Course students error:", error)
    return NextResponse.json(
      { error: "Failed to fetch course students" },
      { status: 500 }
    )
  }
}
