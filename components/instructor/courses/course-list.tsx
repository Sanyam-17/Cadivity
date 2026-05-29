"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { SkeletonTable } from "@/components/shared/skeleton-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  Search,
  X,
  MoreHorizontal,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
} from "lucide-react"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CourseItem {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  status: string
  category: { id: string; name: string } | null
  enrolledCount: number
  completionRate: number
  updatedAt: string
  instructor: { id: string; name: string; image: string | null } | null
}

interface CoursesResponse {
  courses: CourseItem[]
  total: number
  page: number
  pageSize: number
}

export function CourseList() {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const params = React.useMemo(
    () => ({
      page,
      limit: 20,
      ...(status !== "all" ? { status } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, status, debouncedSearch]
  )

  const { data, loading, error, refetch } = useApi<CoursesResponse>({
    url: "/api/instructor/courses",
    params,
  })

  const courses = data?.courses || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / (data?.pageSize || 20))

  // Reset page on filter change
  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="My Courses"
          description="Manage your assigned courses"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" disabled className="gap-2 opacity-60">
                <BookOpen className="h-4 w-4" />
                Create Course
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Course creation is managed by your admin.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
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
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table / Content */}
      {loading ? (
        <SkeletonTable columns={6} rows={6} />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={
            debouncedSearch || status !== "all"
              ? "Try adjusting your search or filters."
              : "You have no courses assigned. Contact your admin to get started."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-[var(--radius-card)] border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Completion</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Updated</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((course, i) => (
                  <tr
                    key={course.id}
                    className={cn(
                      "row-hover hover:bg-muted/30 animate-row-enter stagger-row",
                      i < 5 && "stagger-row"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-md bg-muted overflow-hidden shrink-0">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium line-clamp-1">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                      {course.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {course.enrolledCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{course.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={course.status as any} />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="animate-dropdown-enter">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/instructor/courses/${course.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/instructor/courses/${course.id}?tab=students`}>
                              <Users className="mr-2 h-4 w-4" />
                              View Students
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Preview
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/instructor/courses/${course.id}`}
                className="block rounded-[var(--radius-card)] border border-border bg-card p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-1">{course.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={course.status as any} />
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {course.enrolledCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * (data?.pageSize || 20) + 1}–
                {Math.min(page * (data?.pageSize || 20), total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
