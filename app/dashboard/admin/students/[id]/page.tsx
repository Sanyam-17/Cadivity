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
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Mail,
  Calendar,
  BookOpen,
  KeyRound,
  UserX,
  UserCheck,
  ExternalLink,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import Link from "next/link"

interface StudentDetail {
  id: string
  name: string
  email: string
  image: string | null
  active: boolean
  createdAt: string
  enrollments: Array<{
    id: string
    progress: number
    enrolledAt: string
    lastActivity: string | null
    completedAt: string | null
    course: {
      id: string
      title: string
      thumbnail: string | null
      status: string
    }
  }>
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const { data: student, loading, error, refetch } = useApi<StudentDetail>({
    url: `/api/admin/students/${studentId}`,
  })

  const { mutate, loading: mutating } = useMutation({
    onSuccess: () => refetch(),
    onError: (err) => toast.error(err),
  })

  const [confirmAction, setConfirmAction] = React.useState<
    "deactivate" | "reactivate" | "delete" | null
  >(null)

  const handleConfirm = async () => {
    if (!student) return
    if (confirmAction === "delete") {
      await mutate(`/api/admin/students/${studentId}`, { method: "DELETE" })
      toast.success("Student removed")
      router.push("/admin/students")
    } else {
      const active = confirmAction === "reactivate"
      await mutate(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      })
      toast.success(`Student ${active ? "reactivated" : "deactivated"}`)
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
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
            <div className="h-5 w-36 rounded skeleton-shimmer mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg skeleton-shimmer" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !student) {
    return (
      <DashboardLayout>
        <ErrorState title="Student not found" description={error || "This student does not exist."} onRetry={refetch} />
      </DashboardLayout>
    )
  }

  const initials = student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title={student.name} />
        </div>

        {/* Profile Card */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 lg:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={student.image || ""} alt={student.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-heading">{student.name}</h2>
                  <StatusBadge status={student.active ? "active" : "inactive"} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {student.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined{" "}
                    {new Date(student.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {student.enrollments.length} course
                    {student.enrollments.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm">
                <KeyRound className="mr-2 h-3.5 w-3.5" />
                Reset Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfirmAction(student.active ? "deactivate" : "reactivate")
                }
              >
                {student.active ? (
                  <>
                    <UserX className="mr-2 h-3.5 w-3.5" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-3.5 w-3.5" />
                    Reactivate
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive destructive-glow"
                onClick={() => setConfirmAction("delete")}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h3 className="text-subheading">Enrolled Courses</h3>
            <Button size="sm">
              <BookOpen className="mr-2 h-3.5 w-3.5" />
              Enroll in Course
            </Button>
          </div>

          {student.enrollments.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No enrolled courses"
              description="This student hasn't been enrolled in any courses yet."
              actionLabel="Enroll in Course"
            />
          ) : (
            <div className="divide-y divide-border">
              {student.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between row-hover hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {enrollment.course.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/courses/${enrollment.course.id}`}
                        className="text-sm font-medium hover:text-primary transition-colors truncate block"
                      >
                        {enrollment.course.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enrolled{" "}
                        {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{Math.round(enrollment.progress)}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-1.5" />
                    </div>
                    <StatusBadge
                      status={
                        enrollment.completedAt
                          ? "active"
                          : enrollment.progress > 0
                          ? "pending"
                          : "draft"
                      }
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
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
        title={
          confirmAction === "delete"
            ? `Remove ${student.name}?`
            : confirmAction === "deactivate"
            ? `Deactivate ${student.name}?`
            : `Reactivate ${student.name}?`
        }
        description={
          confirmAction === "delete"
            ? "This action is permanent. All enrollment data will be lost."
            : confirmAction === "deactivate"
            ? "This student will lose access to all courses."
            : "This student will regain access."
        }
        confirmLabel={confirmAction === "delete" ? "Remove" : confirmAction === "deactivate" ? "Deactivate" : "Reactivate"}
        variant={confirmAction === "delete" ? "destructive" : "default"}
        onConfirm={handleConfirm}
        loading={mutating}
      />
    </DashboardLayout>
  )
}
