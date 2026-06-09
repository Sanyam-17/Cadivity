import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { guardApiRole, canManageCourse } from "@/lib/server/auth-guard"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/courses/[courseId]/students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId } = await params

  try {
    if (!(await canManageCourse(courseId, session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const result = await InstructorService.getStudents(session.user.id, {
      page,
      limit,
      courseId,
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
