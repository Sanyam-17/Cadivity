import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { requireApiRole } from "@/lib/server/auth-guard"
import { createCourseSchema, courseStatusSchema } from "@/lib/server/validators/course"
import { withRateLimit } from "@/lib/server/arcjet"

const aj = withRateLimit(20, 60);

// GET /api/admin/courses — paginated course list
export async function GET(request: NextRequest) {
  const session = await requireApiRole("admin")
  if (!session) {
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

  if (status) {
    const parsed = courseStatusSchema.safeParse(status)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    where.status = parsed.data
  }
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
  const session = await requireApiRole("admin")
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = createCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
    }
    const payload = parsed.data

    // Check slug uniqueness
    const existing = await prisma.course.findUnique({ where: { slug: payload.slug } })
    if (existing) {
      return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 })
    }

    const course = await prisma.course.create({
      data: {
        title: payload.title,
        slug: payload.slug,
        description: payload.description ?? null,
        shortDescription: payload.shortDescription ?? null,
        logo: payload.logo ?? null,
        difficultyBadge: payload.difficultyBadge ?? null,
        tags: payload.tags ?? null,
        keyFeatures: payload.keyFeatures ?? [],
        ctaType: payload.ctaType ?? "enroll_now",
        brochureUrl: payload.brochureUrl ?? null,
        price: payload.price ?? null,
        originalPrice: payload.originalPrice ?? null,
        instructorId: payload.instructorId ?? null,
        categoryId: payload.categoryId ?? null,
        status: payload.status ?? "draft",
        whatYouWillLearn: payload.whatYouWillLearn ?? [],
        requirements: payload.requirements ?? [],
        whoIsThisFor: payload.whoIsThisFor ?? [],
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}

