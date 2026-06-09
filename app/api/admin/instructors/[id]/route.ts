import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole } from "@/lib/server/auth-guard"
import { logAdminAction } from "@/lib/services/audit.service"

// GET /api/admin/instructors/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { id } = await params

  try {
    const instructor = await prisma.user.findUnique({
      where: { id, role: "instructor" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        active: true,
        createdAt: true,
        instructorCourses: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            status: true,
            _count: { select: { enrollments: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    })

    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    return NextResponse.json(instructor)
  } catch (error) {
    console.error("Instructor detail error:", error)
    return NextResponse.json({ error: "Failed to fetch instructor" }, { status: 500 })
  }
}

// PATCH /api/admin/instructors/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { id } = await params

  try {
    const body = await request.json()
    const { name, email, active } = body

    const data: any = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (active !== undefined) data.active = active

    const updated = await prisma.user.update({
      where: { id },
      data,
    })

    if (active !== undefined) {
      await logAdminAction({
        adminId: session.user.id,
        action: active ? "INSTRUCTOR_REACTIVATE" : "INSTRUCTOR_DEACTIVATE",
        targetId: id,
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update instructor error:", error)
    return NextResponse.json({ error: "Failed to update instructor" }, { status: 500 })
  }
}

// DELETE /api/admin/instructors/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { id } = await params

  try {
    // Unassign courses first
    await prisma.course.updateMany({
      where: { instructorId: id },
      data: { instructorId: null },
    })

    await prisma.user.delete({ where: { id } })

    await logAdminAction({
      adminId: session.user.id,
      action: "INSTRUCTOR_DELETE",
      targetId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete instructor error:", error)
    return NextResponse.json({ error: "Failed to delete instructor" }, { status: 500 })
  }
}
