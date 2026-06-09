import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { auth } from "@/lib/server/auth"
import { guardApiRole } from "@/lib/server/auth-guard"

// GET /api/admin/instructors — paginated instructor list
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)))
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status")

  const where: any = { role: "instructor" }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  if (status === "active") where.active = true
  if (status === "inactive") where.active = false

  try {
    const [instructors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          active: true,
          createdAt: true,
          _count: { select: { instructorCourses: true } } as any,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      data: instructors.map((i: any) => ({
        ...i,
        assignedCourses: i._count?.instructorCourses ?? 0,
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
    console.error("Instructors list error:", error)
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 })
  }
}

// POST /api/admin/instructors — create an instructor
export async function POST(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Create user via better-auth, then update role to instructor
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
    })

    if (result && (result as any).user?.id) {
      await prisma.user.update({
        where: { id: (result as any).user.id },
        data: { role: "instructor" },
      })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error("Create instructor error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create instructor" },
      { status: 500 }
    )
  }
}

