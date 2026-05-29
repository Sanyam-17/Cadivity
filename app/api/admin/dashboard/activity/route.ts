import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"

// GET /api/admin/dashboard/activity — recent activity feed
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch recent enrollments as activity events
    const recentEnrollments = await prisma.enrollment.findMany({
      take: 10,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: { select: { id: true, name: true, image: true } },
        course: { select: { id: true, title: true } },
      },
    })

    // Fetch recent user registrations
    const recentRegistrations = await prisma.user.findMany({
      where: { role: "student" },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, image: true, createdAt: true },
    })

    // Fetch recently published courses
    const recentCourses = await prisma.course.findMany({
      where: { status: "published" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        instructor: { select: { id: true, name: true } },
      },
    })

    // Merge and sort by timestamp
    type ActivityItem = {
      id: string
      type: "enrollment" | "registration" | "course_published" | "instructor_assigned"
      title: string
      description: string
      timestamp: Date
      avatarName?: string
      avatarImage?: string
    }

    const activities: ActivityItem[] = [
      ...recentEnrollments.map((e) => ({
        id: `enrollment-${e.id}`,
        type: "enrollment" as const,
        title: "New Enrollment",
        description: `${e.student.name} enrolled in ${e.course.title}`,
        timestamp: e.enrolledAt,
        avatarName: e.student.name,
        avatarImage: e.student.image || undefined,
      })),
      ...recentRegistrations.map((u) => ({
        id: `registration-${u.id}`,
        type: "registration" as const,
        title: "New Registration",
        description: `${u.name} joined the platform`,
        timestamp: u.createdAt,
        avatarName: u.name,
        avatarImage: u.image || undefined,
      })),
      ...recentCourses.map((c) => ({
        id: `course-${c.id}`,
        type: "course_published" as const,
        title: "Course Published",
        description: `${c.title} published by ${c.instructor?.name || "Unknown"}`,
        timestamp: c.updatedAt,
        avatarName: c.instructor?.name,
      })),
    ]

    // Sort by timestamp descending, take top 15
    activities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )

    return NextResponse.json(activities.slice(0, 15))
  } catch (error) {
    console.error("Activity feed error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity feed" },
      { status: 500 }
    )
  }
}

