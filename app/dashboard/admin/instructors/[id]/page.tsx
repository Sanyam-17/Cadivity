"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useApi, useMutation } from "@/hooks/use-api"
import {
  ArrowLeft,
  Mail,
  Calendar,
  BookOpen,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Link from "next/link"

interface InstructorDetail {
  id: string
  name: string
  email: string
  image: string | null
  active: boolean
  createdAt: string
  instructorCourses: Array<{
    id: string
    title: string
    thumbnail: string | null
    status: string
    _count: { enrollments: number }
  }>
}

export default function InstructorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const instructorId = params.id as string

  const { data: instructor, loading, error, refetch } = useApi<InstructorDetail>({
    url: `/api/admin/instructors/${instructorId}`,
  })

  const { mutate, loading: mutating } = useMutation({
    onSuccess: () => refetch(),
    onError: (err) => toast.error(err),
  })

  const [confirmAction, setConfirmAction] = React.useState<"deactivate" | "reactivate" | "delete" | null>(null)

  const handleConfirm = async () => {
    if (!instructor) return
    if (confirmAction === "delete") {
      await mutate(`/api/admin/instructors/${instructorId}`, { method: "DELETE" })
      toast.success("Instructor removed")
      router.push("/admin/instructors")
    } else {
      const active = confirmAction === "reactivate"
      await mutate(`/api/admin/instructors/${instructorId}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      })
      toast.success(`Instructor ${active ? "reactivated" : "deactivated"}`)
    }
    setConfirmAction(null)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-32 rounded skeleton-shimmer" />
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full skeleton-shimmer" />
              <div className="space-y-3 flex-1">
                <div className="h-6 w-48 rounded skeleton-shimmer" />
                <div className="h-4 w-64 rounded skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !instructor) {
    return (
      <DashboardLayout>
        <ErrorState title="Instructor not found" description={error || "This instructor does not exist."} onRetry={refetch} />
      </DashboardLayout>
    )
  }

  const initials = instructor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
  const courses = instructor.instructorCourses || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title={instructor.name} />
        </div>

        {/* Profile Card */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 lg:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={instructor.image || ""} />
                <AvatarFallback className="bg-info/10 text-info text-xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-heading">{instructor.name}</h2>
                  <StatusBadge status={instructor.active ? "active" : "inactive"} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{instructor.email}</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {new Date(instructor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{courses.length} course{courses.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm"><KeyRound className="mr-2 h-3.5 w-3.5" />Reset Password</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmAction(instructor.active ? "deactivate" : "reactivate")}>
                {instructor.active ? <><UserX className="mr-2 h-3.5 w-3.5" />Deactivate</> : <><UserCheck className="mr-2 h-3.5 w-3.5" />Reactivate</>}
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive destructive-glow" onClick={() => setConfirmAction("delete")}>
                <Trash2 className="mr-2 h-3.5 w-3.5" />Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Assigned Courses */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h3 className="text-subheading">Assigned Courses</h3>
            <Button size="sm"><BookOpen className="mr-2 h-3.5 w-3.5" />Assign Course</Button>
          </div>

          {courses.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses assigned" description="Assign courses to this instructor to get started." actionLabel="Assign Course" />
          ) : (
            <div className="divide-y divide-border">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-5 row-hover hover:bg-muted/50">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-10 w-14 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/courses/${course.id}`} className="text-sm font-medium hover:text-primary transition-colors truncate block">{course.title}</Link>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{course._count.enrollments} students</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={course.status === "published" ? "published" : "draft"} />
                    <Button variant="ghost" size="sm" className="text-destructive h-8">Unassign</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction === "delete" ? `Remove ${instructor.name}?` : confirmAction === "deactivate" ? `Deactivate ${instructor.name}?` : `Reactivate ${instructor.name}?`}
        description={confirmAction === "delete" ? "This is permanent. Courses will become unassigned." : confirmAction === "deactivate" ? "Their courses will become unassigned." : "They will regain access."}
        confirmLabel={confirmAction === "delete" ? "Remove" : confirmAction === "deactivate" ? "Deactivate" : "Reactivate"}
        variant={confirmAction === "delete" ? "destructive" : "default"}
        onConfirm={handleConfirm}
        loading={mutating}
      />
    </DashboardLayout>
  )
}
