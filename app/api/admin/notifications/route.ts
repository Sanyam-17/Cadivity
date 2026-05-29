import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"

// GET /api/admin/notifications — list notifications for admin
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// PATCH /api/admin/notifications — mark notifications as read
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { ids, markAllRead } = body

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
    } else if (ids && Array.isArray(ids)) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: session.user.id },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notifications error:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}

