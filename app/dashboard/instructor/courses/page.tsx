"use client"

import { InstructorLayout } from "@/components/instructor/layout/instructor-layout"
import { CourseList } from "@/components/instructor/courses/course-list"

export default function InstructorCoursesPage() {
  return (
    <InstructorLayout>
      <CourseList />
    </InstructorLayout>
  )
}
