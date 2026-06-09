import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole, canManageCourse } from "@/lib/server/auth-guard"

// GET /api/instructor/courses/[courseId]/curriculum
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId } = await params

  try {
    if (!(await canManageCourse(courseId, session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            type: true,
            order: true,
            sectionId: true,
            duration: true,
          },
        },
      },
    })

    return NextResponse.json({ sections })
  } catch (error) {
    console.error("Curriculum fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch curriculum" },
      { status: 500 }
    )
  }
}

// POST /api/instructor/courses/[courseId]/curriculum (Create Section)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId } = await params

  try {
    if (!(await canManageCourse(courseId, session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { title } = await request.json()
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    })
    const newOrder = lastSection ? lastSection.order + 1 : 0

    const section = await prisma.section.create({
      data: {
        title,
        courseId,
        order: newOrder,
      },
      include: { lessons: true },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Create section error:", error)
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    )
  }
}
