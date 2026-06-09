import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole } from "@/lib/server/auth-guard"

// GET /api/admin/dashboard/enrollment-trend — enrollment chart data
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get("days") || "7", 10)
  const validDays = [7, 30].includes(days) ? days : 7

  try {
    const now = new Date()
    const startDate = new Date(now.getTime() - validDays * 24 * 60 * 60 * 1000)

    // Fetch enrollments within the date range
    const enrollments = await prisma.enrollment.findMany({
      where: { enrolledAt: { gte: startDate } },
      select: { enrolledAt: true },
      orderBy: { enrolledAt: "asc" },
    })

    // Group by day
    const dayMap: Record<string, number> = {}
    for (let i = 0; i < validDays; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split("T")[0]
      dayMap[key] = 0
    }

    for (const enrollment of enrollments) {
      const key = enrollment.enrolledAt.toISOString().split("T")[0]
      if (key in dayMap) {
        dayMap[key]++
      }
    }

    const data = Object.entries(dayMap).map(([date, count]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      enrollments: count,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Enrollment trend error:", error)
    return NextResponse.json(
      { error: "Failed to fetch enrollment trend" },
      { status: 500 }
    )
  }
}

