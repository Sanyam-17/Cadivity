import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/server/db"

export async function POST(
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

    const { title, type } = await request.json()
    if (!title || !type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 })
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
    })
    const newOrder = lastLesson ? lastLesson.order + 1 : 0

    const lesson = await prisma.lesson.create({
      data: {
        title,
        type,
        sectionId,
        order: newOrder,
        content: null,
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Create lesson error:", error)
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    )
  }
}
