import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { z } from "zod"
import { withRateLimit } from "@/lib/server/arcjet"
import { guardApiExactRole, getRequestIp } from "@/lib/server/auth-guard"
import { errorResponse, successResponse } from "@/lib/server/api-utils"

const aj = withRateLimit(10, 60);
import { logger } from "@/lib/server/logger"

const enrollSchema = z.object({})

// POST /api/courses/[slug]/enroll — enroll a student (authenticated only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { slug },
    })

    if (!course) {
      return errorResponse("Course not found", 404)
    }

    if (course.status !== "published") {
      return errorResponse("Course is not open for enrollment", 403)
    }

    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many enrollment requests", 429)
    }

    // Keep body parse/validation to ensure malformed JSON is rejected.
    const body = await request.json().catch(() => ({}))
    const parsed = enrollSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse("Invalid enrollment payload", 400)
    }

    const guarded = await guardApiExactRole("student", { requireEmailVerified: true })
    if (guarded.error) return guarded.error
    const userId = guarded.session.user.id

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: course.id,
        },
      },
    })

    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          studentId: userId,
          courseId: course.id,
          progress: 0,
        },
      })
      logger.info("enrollment.created", { userId, courseId: course.id, slug })
    }

    return successResponse({
      message: "Enrolled successfully",
      userId,
    })
  } catch (error) {
    logger.error("enrollment.failed", { slug, error: String(error) })
    return errorResponse("Failed to complete enrollment", 500)
  }
}
