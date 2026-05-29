import { redirect } from "next/navigation"
import { requireRole } from "@/lib/server/auth-guard"
import { prisma } from "@/lib/server/db"
import { CourseDetailTabs } from "@/components/instructor/courses/course-detail-tabs"

export default async function InstructorCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const session = await requireRole("instructor")
  const { courseId } = await params

  // Verify ownership before rendering
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, title: true },
  })

  if (!course || course.instructorId !== session.user.id) {
    redirect("/dashboard/instructor/forbidden")
  }

  return <CourseDetailTabs courseId={courseId} courseTitle={course.title} />
}
