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
  Users,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  KeyRound,
  UserX,
  UserCheck,
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import Link from "next/link"

interface Student {
  id: string
  name: string
  email: string
  image: string | null
  active: boolean
  createdAt: string
  enrolledCourses: number
}

interface StudentsResponse {
  data: Student[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function StudentsPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null)
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "delete" | "deactivate" | "reactivate"
    student: Student
  } | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, loading, error, refetch } = useApi<StudentsResponse>({
    url: "/api/admin/students",
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
      setConfirmAction(null)
    },
    onError: (err) => toast.error(err),
  })

  const students = data?.data || []
  const pagination = data?.pagination

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === students.length ? [] : students.map((s) => s.id)
    )
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    const { type, student } = confirmAction

    if (type === "delete") {
      await mutate(`/api/admin/students/${student.id}`, { method: "DELETE" })
      toast.success(`${student.name} removed`)
    } else {
      const active = type === "reactivate"
      await mutate(`/api/admin/students/${student.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      })
      toast.success(`${student.name} ${active ? "reactivated" : "deactivated"}`)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Students"
          description="Manage and monitor enrolled students"
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          }
        />

        {/* Filters & Search */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card">
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 bg-secondary border-0 input-focus-ring"
                />
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-32 bg-secondary border-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 px-4 py-2">
                <span className="text-sm font-medium">
                  {selectedIds.length} selected
                </span>
                <div className="h-4 w-px bg-border" />
                <Button variant="ghost" size="sm" className="h-8">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <SkeletonTable columns={6} rows={6} />
          ) : error ? (
            <ErrorState description={error} onRetry={refetch} />
          ) : students.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students found"
              description={
                search
                  ? "Try adjusting your search or filters."
                  : "Add your first student to get started."
              }
              actionLabel={!search ? "Add Student" : undefined}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3.5 text-left w-10">
                        <Checkbox
                          checked={selectedIds.length === students.length && students.length > 0}
                          onCheckedChange={toggleAll}
                        />
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Student
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Enrolled Courses
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Joined
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((student, idx) => (
                      <tr
                        key={student.id}
                        className={cn(
                          "group row-hover hover:bg-muted/50 animate-row-enter stagger-row"
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <Checkbox
                            checked={selectedIds.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={student.image || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          {student.enrolledCourses}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">
                          {new Date(student.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge
                            status={student.active ? "active" : "inactive"}
                          />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="animate-dropdown-enter">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/students/${student.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  setConfirmAction({
                                    type: student.active ? "deactivate" : "reactivate",
                                    student,
                                  })
                                }
                              >
                                {student.active ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Reactivate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  setConfirmAction({ type: "delete", student })
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="lg:hidden divide-y divide-border">
                {students.map((student) => (
                  <div key={student.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedIds.includes(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.image || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/students/${student.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setConfirmAction({ type: "delete", student })}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <StatusBadge status={student.active ? "active" : "inactive"} />
                      <span className="text-xs text-muted-foreground">
                        {student.enrolledCourses} course{student.enrolledCourses !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border px-5 py-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.pageSize + 1}–
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
                    {pagination.total.toLocaleString()} students
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">
                      {page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page >= pagination.totalPages}
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
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={
          confirmAction?.type === "delete"
            ? `Remove ${confirmAction.student.name}?`
            : confirmAction?.type === "deactivate"
            ? `Deactivate ${confirmAction?.student.name}?`
            : `Reactivate ${confirmAction?.student.name}?`
        }
        description={
          confirmAction?.type === "delete"
            ? "This action is permanent. All enrollment data will be lost."
            : confirmAction?.type === "deactivate"
            ? "This student will lose access to all courses. You can reactivate later."
            : "This student will regain access to their enrolled courses."
        }
        confirmLabel={
          confirmAction?.type === "delete"
            ? "Remove"
            : confirmAction?.type === "deactivate"
            ? "Deactivate"
            : "Reactivate"
        }
        variant={confirmAction?.type === "delete" ? "destructive" : "default"}
        onConfirm={handleConfirmAction}
        loading={mutating}
      />
    </DashboardLayout>
  )
}

