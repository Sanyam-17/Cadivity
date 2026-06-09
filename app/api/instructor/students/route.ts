import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { guardApiRole } from "@/lib/server/auth-guard"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/students
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const courseId = searchParams.get("courseId") || undefined
    const progressRange = searchParams.get("progressRange") || undefined
    const lastActive = searchParams.get("lastActive") || undefined
    const search = searchParams.get("search") || undefined

    const result = await InstructorService.getStudents(session.user.id, {
      page,
      limit,
      courseId,
      progressRange,
      lastActive,
      search,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Instructor students error:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}
