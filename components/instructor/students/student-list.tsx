"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { SkeletonTable } from "@/components/shared/skeleton-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { StudentProgressDrawer } from "./student-progress-drawer"

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

interface StudentsResponse {
  enrollments: EnrollmentItem[]
  total: number
  page: number
  pageSize: number
}

interface CourseSummary {
  id: string
  title: string
}

export function StudentList() {
  const [search, setSearch] = React.useState("")
  const [courseFilter, setCourseFilter] = React.useState<string>("all")
  const [progressFilter, setProgressFilter] = React.useState<string>("all")
  const [lastActiveFilter, setLastActiveFilter] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null)
  const scrollRef = React.useRef(0)
  const debouncedSearch = useDebounce(search, 300)

  const params = React.useMemo(
    () => ({
      page,
      limit: 20,
      ...(courseFilter !== "all" ? { courseId: courseFilter } : {}),
      ...(progressFilter !== "all" ? { progressRange: progressFilter } : {}),
      ...(lastActiveFilter !== "all" ? { lastActive: lastActiveFilter } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, courseFilter, progressFilter, lastActiveFilter, debouncedSearch]
  )

  const { data, loading, error, refetch } = useApi<StudentsResponse>({
    url: "/api/instructor/students",
    params,
  })

  const { data: courses } = useApi<CourseSummary[]>({
    url: "/api/instructor/courses",
    params: { limit: 100, select: "id,title" },
  })

  const enrollments = data?.enrollments || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / (data?.pageSize || 20))

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, courseFilter, progressFilter, lastActiveFilter])

  const handleRowClick = (studentId: string) => {
    scrollRef.current = window.scrollY
    setSelectedStudentId(studentId)
  }

  const handleDrawerClose = () => {
    setSelectedStudentId(null)
    // Restore scroll position
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollRef.current)
    })
  }

  // Group by student to detect adjacent rows
  const prevStudentIds = enrollments.map((e) => e.studentId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Students"
        description="All students enrolled across your courses"
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-0 input-focus-ring"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {courses && courses.length > 0 && (
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={progressFilter} onValueChange={setProgressFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Progress" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Progress</SelectItem>
            <SelectItem value="0-25">0–25%</SelectItem>
            <SelectItem value="26-75">26–75%</SelectItem>
            <SelectItem value="76-100">76–100%</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={lastActiveFilter} onValueChange={setLastActiveFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Last Active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonTable columns={6} rows={6} />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={
            debouncedSearch || courseFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Students will appear here once they enroll in your courses."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-[var(--radius-card)] border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Progress</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Enrolled</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((enrollment, i) => {
                  const isDuplicate = i > 0 && prevStudentIds[i - 1] === enrollment.studentId
                  const initials = enrollment.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <tr
                      key={enrollment.enrollmentId}
                      className={cn(
                        "cursor-pointer row-hover hover:bg-muted/30 animate-row-enter",
                        isDuplicate && "bg-muted/20",
                        i < 5 && "stagger-row"
                      )}
                      onClick={() => handleRowClick(enrollment.studentId)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isDuplicate ? (
                            <div className="h-9 w-9 shrink-0" />
                          ) : (
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarImage src={enrollment.studentAvatar || ""} alt={enrollment.studentName} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                            </Avatar>
                          )}
                          <span className={cn("font-medium", isDuplicate && "text-muted-foreground")}>
                            {isDuplicate ? "" : enrollment.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                        {isDuplicate ? "" : enrollment.studentEmail}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {enrollment.courseName}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${enrollment.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(enrollment.progressPercent)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                        {enrollment.lastActiveAt
                          ? new Date(enrollment.lastActiveAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {enrollments.map((enrollment) => {
              const initials = enrollment.studentName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()

              return (
                <div
                  key={enrollment.enrollmentId}
                  className="rounded-[var(--radius-card)] border border-border bg-card p-4 cursor-pointer hover:border-primary/20 transition-colors"
                  onClick={() => handleRowClick(enrollment.studentId)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={enrollment.studentAvatar || ""} alt={enrollment.studentName} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{enrollment.studentName}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{enrollment.courseName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{Math.round(enrollment.progressPercent)}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * (data?.pageSize || 20) + 1}–
                {Math.min(page * (data?.pageSize || 20), total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Student Progress Drawer */}
      <StudentProgressDrawer
        studentId={selectedStudentId}
        onClose={handleDrawerClose}
      />
    </div>
  )
}
