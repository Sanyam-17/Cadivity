import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import {
  guardApiRole,
  canManageCourse,
  requireSectionInCourse,
} from "@/lib/server/auth-guard"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId, sectionId } = await params

  try {
    if (!(await canManageCourse(courseId, session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!(await requireSectionInCourse(sectionId, courseId))) {
      return NextResponse.json({ error: "Section not found in course" }, { status: 400 })
    }

    const { title } = await request.json()
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const section = await prisma.section.update({
      where: { id: sectionId },
      data: { title },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Update section error:", error)
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> }
) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { courseId, sectionId } = await params

  try {
    if (!(await canManageCourse(courseId, session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!(await requireSectionInCourse(sectionId, courseId))) {
      return NextResponse.json({ error: "Section not found in course" }, { status: 400 })
    }

    await prisma.section.delete({
      where: { id: sectionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete section error:", error)
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    )
  }
}
