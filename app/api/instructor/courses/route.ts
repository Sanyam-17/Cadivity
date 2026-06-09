import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { guardApiRole } from "@/lib/server/auth-guard"
import { InstructorService } from "@/lib/services/instructor.service"

// GET /api/instructor/courses?page=1&limit=20&status=&category=&search=&select=
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("instructor")
  if (guarded.error) return guarded.error
  const session = guarded.session

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
