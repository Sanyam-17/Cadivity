import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/server/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { courseId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { type, items } = await request.json()
    
    // type: "sections" or "lessons"
    // items: { id: string, order: number, sectionId?: string }[]

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items array" }, { status: 400 })
    }

    // Execute updates in a transaction
    await prisma.$transaction(
      items.map((item) => {
        if (type === "sections") {
          return prisma.section.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        } else {
          return prisma.lesson.update({
            where: { id: item.id },
            data: {
              order: item.order,
              ...(item.sectionId ? { sectionId: item.sectionId } : {}),
            },
          })
        }
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
