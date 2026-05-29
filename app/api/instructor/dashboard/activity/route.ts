import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/dashboard/activity
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

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
