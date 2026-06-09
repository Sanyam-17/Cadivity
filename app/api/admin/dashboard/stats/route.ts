import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole } from "@/lib/server/auth-guard"

// GET /api/admin/dashboard/stats — dashboard stat cards
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error

  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const prevMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Total counts
    const [totalStudents, totalInstructors, totalCourses] = await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "instructor" } }),
      prisma.course.count(),
    ])

    // Week-over-week deltas for students
    const [newStudentsThisWeek, newStudentsPrevWeek] = await Promise.all([
      prisma.user.count({
        where: { role: "student", createdAt: { gte: weekAgo } },
      }),
      prisma.user.count({
        where: {
          role: "student",
          createdAt: {
            gte: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: weekAgo,
          },
        },
      }),
    ])

    // Month-over-month deltas for instructors
    const [newInstructorsThisMonth, newInstructorsPrevMonth] = await Promise.all([
      prisma.user.count({
        where: { role: "instructor", createdAt: { gte: monthAgo } },
      }),
      prisma.user.count({
        where: {
          role: "instructor",
          createdAt: { gte: prevMonthStart, lt: monthAgo },
        },
      }),
    ])

    // Month-over-month deltas for courses
    const [newCoursesThisMonth, newCoursesPrevMonth] = await Promise.all([
      prisma.course.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.course.count({
        where: { createdAt: { gte: prevMonthStart, lt: monthAgo } },
      }),
    ])

    // Total enrollments as a revenue proxy
    const totalEnrollments = await prisma.enrollment.count()

    const calcDelta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100 * 10) / 10
    }

    return NextResponse.json({
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      deltas: {
        students: {
          value: newStudentsThisWeek,
          percentage: calcDelta(newStudentsThisWeek, newStudentsPrevWeek),
          label: "this week",
        },
        instructors: {
          value: newInstructorsThisMonth,
          percentage: calcDelta(newInstructorsThisMonth, newInstructorsPrevMonth),
          label: "this month",
        },
        courses: {
          value: newCoursesThisMonth,
          percentage: calcDelta(newCoursesThisMonth, newCoursesPrevMonth),
          label: "this month",
        },
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}

