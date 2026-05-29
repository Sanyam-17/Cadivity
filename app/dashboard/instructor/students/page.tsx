"use client"

import { InstructorLayout } from "@/components/instructor/layout/instructor-layout"
import { StudentList } from "@/components/instructor/students/student-list"

export default function InstructorStudentsPage() {
  return (
    <InstructorLayout>
      <StudentList />
    </InstructorLayout>
  )
}
