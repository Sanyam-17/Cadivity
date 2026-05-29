import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/dashboard/stats
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

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
