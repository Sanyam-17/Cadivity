"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { SkeletonTable } from "@/components/shared/skeleton-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useApi, useMutation } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Copy,
  Archive,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Link from "next/link"

interface Course {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  status: string
  instructorId: string | null
  instructor: { id: string; name: string; image: string | null } | null
  category: { id: string; name: string } | null
  enrolledStudents: number
  sectionCount: number
  updatedAt: string
  createdAt: string
}

interface CoursesResponse {
  data: Course[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function CoursesPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [deleteTarget, setDeleteTarget] = React.useState<Course | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, loading, error, refetch } = useApi<CoursesResponse>({
    url: "/api/admin/courses",
    params: {
      page,
      pageSize: 10,
      search: debouncedSearch || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
  })

  const { mutate, loading: mutating } = useMutation({
    onSuccess: () => {
      refetch()
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(err),
  })

  const courses = data?.data || []
  const pagination = data?.pagination

  const handleDelete = async () => {
    if (!deleteTarget) return
    await mutate(`/api/admin/courses/${deleteTarget.id}`, { method: "DELETE" })
    toast.success(`"${deleteTarget.title}" deleted`)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published": return "published" as const
      case "draft": return "draft" as const
      case "archived": return "archived" as const
      default: return "draft" as const
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Courses"
          description="Create and manage all courses"
          actions={
            <Button asChild>
              <Link href="/admin/courses/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Link>
            </Button>
          }
        />

        {/* Filters */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10 bg-secondary border-0 input-focus-ring"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-36 bg-secondary border-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <SkeletonTable columns={6} rows={6} />
          ) : error ? (
            <ErrorState description={error} onRetry={refetch} />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description={search ? "Try adjusting your search." : "Create your first course to get started."}
              actionLabel={!search ? "Create Course" : undefined}
            />
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Course</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Instructor</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Students</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Updated</th>
                      <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {courses.map((course) => (
                      <tr key={course.id} className="group row-hover hover:bg-muted/50 animate-row-enter stagger-row">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-14 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                              {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                              ) : (
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/admin/courses/${course.id}`} className="text-sm font-medium hover:text-primary transition-colors truncate block">
                                {course.title}
                              </Link>
                              {course.category && (
                                <span className="text-xs text-muted-foreground">{course.category.name}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {course.instructor ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={course.instructor.image || ""} />
                                <AvatarFallback className="text-[10px] bg-info/10 text-info">
                                  {course.instructor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{course.instructor.name}</span>
                            </div>
                          ) : (
                            <StatusBadge status="unassigned" />
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {course.enrolledStudents}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={getStatusVariant(course.status)} />
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">
                          {new Date(course.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="animate-dropdown-enter">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/courses/${course.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(course)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="lg:hidden divide-y divide-border">
                {courses.map((course) => (
                  <Link key={course.id} href={`/admin/courses/${course.id}`} className="flex items-center justify-between p-4 row-hover hover:bg-muted/50">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-14 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.enrolledStudents} students</p>
                      </div>
                    </div>
                    <StatusBadge status={getStatusVariant(course.status)} />
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-4">
                  <p className="text-sm text-muted-foreground">
                    {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">{page} / {pagination.totalPages}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This will permanently delete this course and all its sections, lessons, and enrollments."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={mutating}
      />
    </DashboardLayout>
  )
}

