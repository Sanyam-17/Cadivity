import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole } from "@/lib/server/auth-guard"
import { logAdminAction } from "@/lib/services/audit.service"

// GET /api/admin/students/[id] — single student detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { id } = await params

  try {
    const student = await prisma.user.findUnique({
      where: { id, role: "student" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        active: true,
        createdAt: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                status: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Student detail error:", error)
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

// PATCH /api/admin/students/[id] — update student
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
        action: active ? "USER_REACTIVATE" : "USER_DEACTIVATE",
        targetId: id,
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update student error:", error)
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
  }
}

// DELETE /api/admin/students/[id] — remove student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  const { id } = await params

  try {
    await prisma.user.delete({ where: { id } })

    await logAdminAction({
      adminId: session.user.id,
      action: "USER_DELETE",
      targetId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete student error:", error)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
