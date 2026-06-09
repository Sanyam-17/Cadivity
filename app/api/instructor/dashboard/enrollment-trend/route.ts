import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { guardApiRole } from "@/lib/server/auth-guard"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/dashboard/enrollment-trend?days=7&courseId=optional
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7", 10)
    const courseId = searchParams.get("courseId") || undefined

    const data = await InstructorService.getEnrollmentTrend(
      session.user.id,
      days,
      courseId
    )

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Instructor enrollment trend error:", error)
    return NextResponse.json(
      { error: "Failed to fetch enrollment trend" },
      { status: 500 }
    )
  }
}
