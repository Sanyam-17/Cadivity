import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { guardApiRole } from "@/lib/server/auth-guard"
import { prisma } from "@/lib/server/db"

// GET /api/instructor/notifications?page=1&limit=20
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: session.user.id } }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ])

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        read: n.read,
        targetUrl: n.targetUrl,
        createdAt: n.createdAt.toISOString(),
      })),
      total,
      unreadCount,
      page,
      pageSize: limit,
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// PATCH /api/instructor/notifications — mark as read
export async function PATCH(request: NextRequest) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const body = await request.json()
    const { notificationId, markAllRead } = body

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      // Verify ownership
      const notif = await prisma.notification.findFirst({
        where: { id: notificationId, userId: session.user.id },
      })
      if (!notif) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Missing notificationId or markAllRead" }, { status: 400 })
  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}
