import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/server/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId, sectionId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId, sectionId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
