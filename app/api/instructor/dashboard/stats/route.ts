import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { guardApiRole } from "@/lib/server/auth-guard"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/dashboard/stats
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const stats = await InstructorService.getDashboardStats(session.user.id)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Instructor dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
