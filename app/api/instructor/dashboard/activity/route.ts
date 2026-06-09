import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { guardApiRole } from "@/lib/server/auth-guard"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/dashboard/activity
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const events = await InstructorService.getRecentActivity(session.user.id)
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Instructor activity error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    )
  }
}
