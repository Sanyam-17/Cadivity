import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logAdminAction } from "@/lib/services/audit.service";
import { courses } from "@/lib/courseData";

// PATCH /api/admin/courses/[courseId] — toggle published status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;
  const body = await request.json();
  const { published } = body;

  if (typeof published !== "boolean") {
    return NextResponse.json({ error: "Invalid published status" }, { status: 400 });
  }

  // Mocking the update since 'Course' model doesn't exist in schema
  const course = courses.find(c => c.slug === courseId);
  const updatedCourse = {
    id: courseId,
    title: course?.title || "Unknown Course",
    published,
    status: published ? "published" : "draft" 
  };

  await logAdminAction({
    adminId: session.user.id,
    action: "COURSE_TOGGLE_PUBLISH",
    targetId: courseId,
  });

  return NextResponse.json(updatedCourse);
}

// DELETE /api/admin/courses/[courseId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;

  // Mock lookup in static data
  const courseData = courses.find(c => c.slug === courseId);

  if (!courseData) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await logAdminAction({
    adminId: session.user.id,
    action: "COURSE_DELETE",
    targetId: courseId,
    meta: JSON.stringify({ title: courseData.title }),
  });

  return NextResponse.json({ success: true });
}
