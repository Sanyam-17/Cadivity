"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { SkeletonTable } from "@/components/shared/skeleton-table"
import { useApi, useMutation } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import {
  GraduationCap,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  UserX,
  UserCheck,
  BookOpen,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

interface Instructor {
  id: string
  name: string
  email: string
  image: string | null
  active: boolean
  createdAt: string
  assignedCourses: number
}

interface InstructorsResponse {
  data: Instructor[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function InstructorsPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [addForm, setAddForm] = React.useState({ name: "", email: "", password: "" })

  const debouncedSearch = useDebounce(search, 300)

  const { data, loading, error, refetch } = useApi<InstructorsResponse>({
    url: "/api/admin/instructors",
    params: {
      page,
      pageSize: 10,
      search: debouncedSearch || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
  })

  const { mutate, loading: adding } = useMutation({
    onSuccess: () => {
      refetch()
      setShowAddModal(false)
      setAddForm({ name: "", email: "", password: "" })
      toast.success("Instructor added")
    },
    onError: (err) => toast.error(err),
  })

  const instructors = data?.data || []
  const pagination = data?.pagination

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error("All fields are required")
      return
    }
    await mutate("/api/admin/instructors", {
      method: "POST",
      body: JSON.stringify(addForm),
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Instructors"
          description="Manage instructor accounts and course assignments"
          actions={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Instructor
            </Button>
          }
        />

        {/* Filters & Search */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search instructors..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10 bg-secondary border-0 input-focus-ring"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); setPage(1) }}
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

          {/* Table */}
          {loading ? (
            <SkeletonTable columns={5} rows={6} />
          ) : error ? (
            <ErrorState description={error} onRetry={refetch} />
          ) : instructors.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No instructors found"
              description={search ? "Try adjusting your search." : "Add your first instructor to get started."}
              actionLabel={!search ? "Add Instructor" : undefined}
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Instructor</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Assigned Courses</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Joined</th>
                      <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {instructors.map((instructor) => (
                      <tr key={instructor.id} className="group row-hover hover:bg-muted/50 animate-row-enter stagger-row">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={instructor.image || ""} />
                              <AvatarFallback className="bg-info/10 text-info text-xs">
                                {instructor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{instructor.name}</p>
                              <p className="text-xs text-muted-foreground">{instructor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            {instructor.assignedCourses}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">
                          {new Date(instructor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={instructor.active ? "active" : "inactive"} />
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
                                <Link href={`/admin/instructors/${instructor.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Assign Courses
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
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
                {instructors.map((instructor) => (
                  <Link key={instructor.id} href={`/admin/instructors/${instructor.id}`} className="flex items-center justify-between p-4 row-hover hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={instructor.image || ""} />
                        <AvatarFallback className="bg-info/10 text-info text-xs">
                          {instructor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{instructor.name}</p>
                        <p className="text-xs text-muted-foreground">{instructor.assignedCourses} courses</p>
                      </div>
                    </div>
                    <StatusBadge status={instructor.active ? "active" : "inactive"} />
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-4">
                  <p className="text-sm text-muted-foreground">
                    {(pagination.page - 1) * pagination.pageSize + 1}–
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
                    {pagination.total}
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

      {/* Add Instructor Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 animate-backdrop-enter" onClick={() => setShowAddModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-modal)] bg-card shadow-xl animate-modal-enter">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-subheading">Add Instructor</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleAddInstructor} className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={addForm.name} onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" className="input-focus-ring" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={addForm.email} onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@cadivity.com" className="input-focus-ring" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input id="password" type="password" value={addForm.password} onChange={(e) => setAddForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" className="input-focus-ring" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" disabled={adding}>
                  {adding ? "Adding..." : "Add Instructor"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}

