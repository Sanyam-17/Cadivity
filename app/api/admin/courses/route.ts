import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"

// GET /api/admin/courses — paginated course list
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)))
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status")
  const categoryId = searchParams.get("categoryId")
  const instructorId = searchParams.get("instructorId")

  const where: any = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
    ]
  }

  if (status) where.status = status
  if (categoryId) where.categoryId = categoryId
  if (instructorId) where.instructorId = instructorId

  try {
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { enrollments: true, sections: true } } as any,
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ])

    return NextResponse.json({
      data: courses.map((c: any) => ({
        ...c,
        enrolledStudents: c._count?.enrollments ?? 0,
        sectionCount: c._count?.sections ?? 0,
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
    console.error("Courses list error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST /api/admin/courses — create a course
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, slug, description, instructorId, categoryId, status: courseStatus } = body

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 })
    }

    // Check slug uniqueness
    const existing = await prisma.course.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        instructorId: instructorId || null,
        categoryId: categoryId || null,
        status: courseStatus || "draft",
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}

