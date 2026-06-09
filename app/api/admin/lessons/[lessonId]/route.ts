import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole } from "@/lib/server/auth-guard"
import { logAdminAction } from "@/lib/services/audit.service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { lessonId } = await params

  try {
    const { title, type, order, youtubeVideoId, duration } = await request.json()

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(order !== undefined && { order }),
        ...(youtubeVideoId !== undefined && { youtubeVideoId }),
        ...(duration !== undefined && { duration }),
      },
    })

    await logAdminAction({
      adminId: session.user.id,
      action: "LESSON_UPDATE",
      targetId: lessonId,
      meta: JSON.stringify({ title, type, youtubeVideoId }),
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Update lesson error:", error)
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { lessonId } = await params

  try {
    await prisma.lesson.delete({
      where: { id: lessonId },
    })

    await logAdminAction({
      adminId: session.user.id,
      action: "LESSON_DELETE",
      targetId: lessonId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete lesson error:", error)
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
}
