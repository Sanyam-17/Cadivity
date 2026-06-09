import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { requireApiSession } from "@/lib/server/auth-guard"
import { getUserRole, ROLES } from "@/lib/roles"
import { z } from "zod"
import { parsePagination, errorResponse } from "@/lib/server/api-utils"

const statusSchema = z.enum(["draft", "published", "archived"])

// GET /api/courses?status=published — public endpoint (no auth)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const requestedStatus = searchParams.get("status")
  const { page, pageSize, skip } = parsePagination(searchParams, { page: 1, pageSize: 50 })

  const where: Record<string, unknown> = {}

  const session = await requireApiSession()
  const role = session ? getUserRole(session.user) : null
  const isPrivileged = role === ROLES.ADMIN || role === ROLES.INSTRUCTOR

  if (!isPrivileged) {
    where.status = "published"
  } else if (requestedStatus) {
    const parsed = statusSchema.safeParse(requestedStatus)
    if (!parsed.success) {
      return errorResponse("Invalid status filter", 400)
    }
    where.status = parsed.data
  }

  try {
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          logo: true,
          difficultyBadge: true,
          tags: true,
          keyFeatures: true,
          ctaType: true,
          brochureUrl: true,
          price: true,
          originalPrice: true,
          thumbnail: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ])

    const response = NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })

    if (!isPrivileged) {
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    } else {
      response.headers.set("Cache-Control", "private, no-store")
    }

    return response
  } catch (error) {
    console.error("Public courses fetch error:", error)
    return errorResponse("Failed to fetch courses", 500)
  }
}
