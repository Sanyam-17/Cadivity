import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/server/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string; lessonId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId, lessonId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    })

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Fetch lesson error:", error)
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string; lessonId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId, lessonId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, type, content, duration } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (type !== undefined) updateData.type = type
    if (content !== undefined) updateData.content = content
    if (duration !== undefined) updateData.duration = duration

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Update lesson error:", error)
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string; lessonId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId, lessonId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete lesson error:", error)
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    )
  }
}
