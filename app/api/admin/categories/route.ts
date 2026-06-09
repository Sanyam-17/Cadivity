import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { guardApiRole, getRequestIp } from "@/lib/server/auth-guard"
import { parseJsonBody, errorResponse } from "@/lib/server/api-utils"
import { categoryCreateSchema, categoryDeleteSchema, categoryUpdateSchema } from "@/lib/server/validators/admin"
import { withRateLimit } from "@/lib/server/arcjet"

const aj = withRateLimit(30, 60);

// GET /api/admin/categories
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        courseCount: c._count.courses,
        createdAt: c.createdAt,
      }))
    )
  } catch (error) {
    console.error("Categories error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST /api/admin/categories — create category
export async function POST(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many requests", 429)
    }

    const parsed = await parseJsonBody(request, categoryCreateSchema)
    if (parsed.error) return parsed.error

    const category = await prisma.category.create({
      data: { name: parsed.data.name },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 })
    }
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

// PATCH /api/admin/categories — update category
export async function PATCH(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many requests", 429)
    }

    const parsed = await parseJsonBody(request, categoryUpdateSchema)
    if (parsed.error) return parsed.error

    const updated = await prisma.category.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update category error:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE /api/admin/categories
export async function DELETE(request: NextRequest) {
  const guarded = await guardApiRole("admin")
  if (guarded.error) return guarded.error
  const session = guarded.session

  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return errorResponse("Too many requests", 429)
    }

    const parsed = await parseJsonBody(request, categoryDeleteSchema)
    if (parsed.error) return parsed.error
    const { id } = parsed.data

    const courseCount = await prisma.course.count({ where: { categoryId: id } })
    if (courseCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${courseCount} course(s) are using this category. Reassign them first.` },
        { status: 409 }
      )
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}

