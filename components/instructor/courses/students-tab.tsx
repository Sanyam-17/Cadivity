"use client"

import * as React from "react"
import { useApi } from "@/hooks/use-api"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { SkeletonTable } from "@/components/shared/skeleton-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, ChevronLeft, ChevronRight } from "lucide-react"
import { StudentProgressDrawer } from "@/components/instructor/students/student-progress-drawer"

interface EnrollmentItem {
  enrollmentId: string
  studentId: string
  studentName: string
  studentEmail: string
  studentAvatar: string | null
  courseId: string
  courseName: string
  progressPercent: number
  enrolledAt: string
  lastActiveAt: string | null
}

interface CourseStudentsResponse {
  enrollments: EnrollmentItem[]
  total: number
  page: number
  pageSize: number
}

interface StudentsTabProps {
  courseId: string
}

export function StudentsTab({ courseId }: StudentsTabProps) {
  const [page, setPage] = React.useState(1)
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null)

  const { data, loading, error, refetch } = useApi<CourseStudentsResponse>({
    url: `/api/instructor/courses/${courseId}/students`,
    params: { page, limit: 20 },
  })

  const enrollments = data?.enrollments || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / (data?.pageSize || 20))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enrolled Students</h3>
          <p className="text-sm text-muted-foreground">Manage students enrolled in this course.</p>
        </div>
        <div className="text-sm font-medium">
          Total: <span className="text-muted-foreground">{total}</span>
        </div>
      </div>

      {loading ? (
        <SkeletonTable columns={5} rows={5} />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students enrolled yet"
          description="Students will appear here once they enroll."
        />
      ) : (
        <>
          <div className="rounded-[var(--radius-card)] border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Enrolled</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((e) => {
                  const initials = e.studentName.substring(0, 2).toUpperCase()
                  return (
                    <tr
                      key={e.enrollmentId}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedStudentId(e.studentId)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={e.studentAvatar || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{e.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground">
                        {e.studentEmail}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden hidden sm:block">
                            <div className="h-full bg-primary" style={{ width: `${e.progressPercent}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(e.progressPercent)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(e.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-xs text-muted-foreground">
                        {e.lastActiveAt ? new Date(e.lastActiveAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * (data?.pageSize || 20) + 1}–{Math.min(page * (data?.pageSize || 20), total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <StudentProgressDrawer
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  )
}
