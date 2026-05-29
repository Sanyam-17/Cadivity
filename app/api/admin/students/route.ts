import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"

// GET /api/admin/students — paginated student list
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)))
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") // "active" | "inactive"
  const courseId = searchParams.get("courseId")

  const where: any = { role: "student" }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  if (status === "active") where.active = true
  if (status === "inactive") where.active = false

  if (courseId) {
    where.enrollments = { some: { courseId } }
  }

  try {
    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          active: true,
          _count: { select: { enrollments: true } } as any,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      data: students.map((s: any) => ({
        ...s,
        enrolledCourses: s._count?.enrollments ?? 0,
        _count: undefined,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Students list error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// POST /api/admin/students — create a student
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Use better-auth to create the user
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error("Create student error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 }
    )
  }
}

