import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/db"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"

// GET /api/admin/categories
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name } = await request.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, name } = await request.json()
    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 })
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update category error:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE /api/admin/categories
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Check if courses are using the category
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

