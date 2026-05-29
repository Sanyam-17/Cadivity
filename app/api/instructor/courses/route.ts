import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/server/auth"
import { headers } from "next/headers"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/courses?page=1&limit=20&status=&category=&search=&select=
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as any).role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const status = searchParams.get("status") || undefined
    const category = searchParams.get("category") || undefined
    const search = searchParams.get("search") || undefined
    const select = searchParams.get("select") || undefined

    // Lightweight mode for dropdowns: return only id + title
    if (select === "id,title") {
      const result = await InstructorService.getCourses(session.user.id, {
        page: 1,
        limit: parseInt(searchParams.get("limit") || "100", 10),
      })
      return NextResponse.json(
        result.courses.map((c) => ({ id: c.id, title: c.title }))
      )
    }

    const result = await InstructorService.getCourses(session.user.id, {
      page,
      limit,
      status,
      category,
      search,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Instructor courses error:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
