import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole, getRequestIp } from "@/lib/server/auth-guard"
import { parseJsonBody } from "@/lib/server/api-utils"
import { createSectionSchema } from "@/lib/server/validators/common"
import { withRateLimit } from "@/lib/server/arcjet"
import { logAdminAction } from "@/lib/services/audit.service"

const aj = withRateLimit(30, 60);

export async function POST(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const parsed = await parseJsonBody(request, createSectionSchema)
    if (parsed.error) return parsed.error
    const { title, courseId } = parsed.data

    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    })

    const order = lastSection ? lastSection.order + 1 : 0

    const section = await prisma.section.create({
      data: {
        title,
        courseId,
        order,
      },
    })

    await logAdminAction({
      adminId: session.user.id,
      action: "SECTION_CREATE",
      targetId: section.id,
      meta: JSON.stringify({ courseId }),
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Create section error:", error)
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}
