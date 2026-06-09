import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole } from "@/lib/server/auth-guard"
import { logAdminAction } from "@/lib/services/audit.service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { sectionId } = await params

  try {
    const { title, order } = await request.json()

    const section = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(title !== undefined && { title }),
        ...(order !== undefined && { order }),
      },
    })

    await logAdminAction({
      adminId: session.user.id,
      action: "SECTION_UPDATE",
      targetId: sectionId,
      meta: JSON.stringify({ title, order }),
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Update section error:", error)
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { sectionId } = await params

  try {
    await prisma.section.delete({
      where: { id: sectionId },
    })

    await logAdminAction({
      adminId: session.user.id,
      action: "SECTION_DELETE",
      targetId: sectionId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete section error:", error)
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 })
  }
}
