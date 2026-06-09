import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole, canManageCourse } from "@/lib/server/auth-guard"

export async function PUT(
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

    const { type, items } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items array" }, { status: 400 })
    }

    await prisma.$transaction(
      items.map((item: { id: string; order: number; sectionId?: string }) => {
        if (type === "sections") {
          return prisma.section.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        }
        return prisma.lesson.update({
          where: { id: item.id },
          data: {
            order: item.order,
            ...(item.sectionId ? { sectionId: item.sectionId } : {}),
          },
        })
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reorder curriculum error:", error)
    return NextResponse.json(
      { error: "Failed to reorder curriculum" },
      { status: 500 }
    )
  }
}
