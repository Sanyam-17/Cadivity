/**
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  ADMIN ROUTE HANDLER — PATTERN REFERENCE                       │
 * │                                                                  │
 * │  All admin API routes MUST follow these conventions:             │
 * │                                                                  │
 * │  1. AUTH:   Use `guardApiRole("admin")`.                        │
 * │             if (guarded.error) return guarded.error;             │
 * │             DO NOT use `requireApiRole()` (legacy).              │
 * │                                                                  │
 * │  2. RATE-LIMIT: Call `aj.protect(request)` BEFORE auth          │
 * │             on write endpoints (POST/PUT/PATCH/DELETE).          │
 * │                                                                  │
 * │  3. RESPONSES:                                                   │
 * │     - Success: `successResponse(data)` or                       │
 * │                `successResponse(data, 201)`.                    │
 * │     - Client errors: `errorResponse(msg, 4xx)`.                 │
 * │     - Validation: `validationError(zodError)`.                  │
 * │                                                                  │
 * │  4. TYPES:  `Prisma.CourseWhereInput`, never `any`.             │
 * │                                                                  │
 * │  5. LOGGING: `logger.info()` on success,                        │
 * │              `logger.error()` in catch blocks.                   │
 * └──────────────────────────────────────────────────────────────────┘
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole } from "@/lib/server/auth-guard"
import { createCourseSchema, courseStatusSchema } from "@/lib/server/validators/course"
import { successResponse, errorResponse, validationError } from "@/lib/server/api-utils"
import { withRateLimit } from "@/lib/server/arcjet"
import { logger } from "@/lib/server/logger"
import type { Prisma } from "@prisma/client"

// ── Rate limiter ─────────────────────────────────────────────────────────────
const aj = withRateLimit(20, 60);

// ─── GET /api/admin/courses — paginated course list ──────────────────────────

export async function GET(request: NextRequest) {
  // [CHANGE] guardApiRole replaces requireApiRole (standardised error shape)
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)))
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status")
  const categoryId = searchParams.get("categoryId")
  const instructorId = searchParams.get("instructorId")

  // [CHANGE] Prisma.CourseWhereInput replaces `any`
  const where: Prisma.CourseWhereInput = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
    ]
  }

  if (status) {
    const parsed = courseStatusSchema.safeParse(status)
    if (!parsed.success) {
      // [CHANGE] errorResponse replaces raw NextResponse.json
      return errorResponse("Invalid status filter", 400)
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
          _count: { select: { enrollments: true, sections: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ])

    // [CHANGE] logger.info replaces silent success
    logger.info("Admin courses listed", {
      adminId: guarded.session.user.id,
      page,
      total,
    })

    // [CHANGE] successResponse replaces raw NextResponse.json
    return successResponse({
      courses: courses.map((c) => ({
        ...c,
        enrolledStudents: c._count.enrollments,
        sectionCount: c._count.sections,
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
    // [CHANGE] logger.error replaces console.error
    logger.error("Admin courses list failed", {
      error: error instanceof Error ? error.message : String(error),
      adminId: guarded.session.user.id,
    })
    return errorResponse("Failed to fetch courses", 500)
  }
}

// ─── POST /api/admin/courses — create a course ──────────────────────────────

export async function POST(request: NextRequest) {
  // [CHANGE] Rate-limit check moved BEFORE auth — reject bots before hitting DB
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    return errorResponse("Too many requests", 429)
  }

  // [CHANGE] guardApiRole replaces requireApiRole
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error

  try {
    const body = await request.json().catch(() => ({}))
    const parsed = createCourseSchema.safeParse(body)
    if (!parsed.success) {
      // [CHANGE] validationError replaces raw NextResponse.json
      return validationError(parsed.error)
    }
    const payload = parsed.data

    // Check slug uniqueness
    const existing = await prisma.course.findUnique({ where: { slug: payload.slug } })
    if (existing) {
      return errorResponse("A course with this slug already exists", 409)
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

    // [CHANGE] Structured log on successful creation
    logger.info("Course created", {
      courseId: course.id,
      slug: course.slug,
      adminId: guarded.session.user.id,
    })

    // [CHANGE] successResponse with 201 replaces raw NextResponse.json
    return successResponse(course, 201)
  } catch (error) {
    // [CHANGE] logger.error replaces console.error
    logger.error("Course creation failed", {
      error: error instanceof Error ? error.message : String(error),
      adminId: guarded.session.user.id,
    })
    return errorResponse("Failed to create course", 500)
  }
}
