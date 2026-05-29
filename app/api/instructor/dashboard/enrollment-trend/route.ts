import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/dashboard/enrollment-trend?days=7&courseId=optional
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

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
