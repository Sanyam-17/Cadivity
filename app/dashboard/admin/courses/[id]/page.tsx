"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useApi, useMutation } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  BookOpen,
  Users,
  Settings,
  LayoutList,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import Link from "next/link"

interface CourseDetail {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  status: string
  visibility: string
  completionCriteria: string
  seoTitle: string | null
  seoDescription: string | null
  instructorId: string | null
  instructor: { id: string; name: string; image: string | null } | null
  category: { id: string; name: string } | null
  sections: Array<{
    id: string
    title: string
    order: number
    lessons: Array<{
      id: string
      title: string
      type: string
      duration: number | null
      order: number
    }>
  }>
  enrolledStudents: number
  sectionCount: number
  createdAt: string
  updatedAt: string
}

type TabId = "overview" | "curriculum" | "students" | "settings"

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "curriculum", label: "Curriculum", icon: LayoutList },
  { id: "students", label: "Students", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
]

const lessonTypeIcons: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [activeTab, setActiveTab] = React.useState<TabId>("overview")
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set())

  const { data: course, loading, error, refetch } = useApi<CourseDetail>({
    url: `/api/admin/courses/${courseId}`,
  })

  const { mutate } = useMutation({
    onSuccess: () => refetch(),
    onError: (err) => toast.error(err),
  })

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  const expandAll = () => {
    if (course) {
      setExpandedSections(new Set(course.sections.map((s) => s.id)))
    }
  }

  const collapseAll = () => setExpandedSections(new Set())

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-48 rounded skeleton-shimmer" />
          <div className="h-12 w-full rounded-lg skeleton-shimmer" />
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-8">
            <div className="space-y-4">
              <div className="h-6 w-64 rounded skeleton-shimmer" />
              <div className="h-4 w-full rounded skeleton-shimmer" />
              <div className="h-4 w-3/4 rounded skeleton-shimmer" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <ErrorState title="Course not found" description={error || "This course does not exist."} onRetry={refetch} />
      </DashboardLayout>
    )
  }

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-heading truncate">{course.title}</h1>
              <StatusBadge status={course.status === "published" ? "published" : course.status === "archived" ? "archived" : "draft"} />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              {course.instructor && (
                <span className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-[8px]">
                      {course.instructor.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {course.instructor.name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {course.enrolledStudents} students
              </span>
              <span className="flex items-center gap-1.5">
                <LayoutList className="h-3.5 w-3.5" />
                {course.sections.length} sections · {totalLessons} lessons
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const newStatus = course.status === "published" ? "draft" : "published"
                await mutate(`/api/admin/courses/${courseId}`, {
                  method: "PATCH",
                  body: JSON.stringify({ status: newStatus }),
                })
                toast.success(newStatus === "published" ? "Course published" : "Course unpublished")
              }}
            >
              {course.status === "published" ? (
                <><EyeOff className="mr-2 h-3.5 w-3.5" />Unpublish</>
              ) : (
                <><Eye className="mr-2 h-3.5 w-3.5" />Publish</>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
                <h3 className="text-subheading mb-3">Description</h3>
                {course.description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description added yet.</p>
                )}
              </div>

              <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
                <h3 className="text-subheading mb-4">Course Stats</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Sections", value: course.sections.length },
                    { label: "Lessons", value: totalLessons },
                    { label: "Students", value: course.enrolledStudents },
                    { label: "Status", value: course.status, capitalize: true },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-secondary/50 p-4 text-center">
                      <p className="text-2xl font-bold capitalize">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Instructor Card */}
              <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
                <h3 className="text-subheading mb-4">Instructor</h3>
                {course.instructor ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={course.instructor.image || ""} />
                      <AvatarFallback className="bg-info/10 text-info">
                        {course.instructor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/admin/instructors/${course.instructor.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {course.instructor.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">Instructor</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No instructor assigned</p>
                )}
              </div>

              {/* Meta */}
              <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-3">
                <h3 className="text-subheading mb-3">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{course.category?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Visibility</span>
                    <span className="flex items-center gap-1.5 font-medium capitalize">
                      {course.visibility === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      {course.visibility}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{new Date(course.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="font-medium">{new Date(course.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {course.sections.length} section{course.sections.length !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={expandedSections.size > 0 ? collapseAll : expandAll}>
                  {expandedSections.size > 0 ? "Collapse All" : "Expand All"}
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add Section
                </Button>
              </div>
            </div>

            {course.sections.length === 0 ? (
              <EmptyState
                icon={LayoutList}
                title="No sections yet"
                description="Start building your curriculum by adding sections and lessons."
                actionLabel="Add Section"
              />
            ) : (
              <div className="space-y-3">
                {course.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const isExpanded = expandedSections.has(section.id)
                    return (
                      <div
                        key={section.id}
                        className="rounded-[var(--radius-card)] border border-border bg-card overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                isExpanded && "rotate-90"
                              )}
                            />
                            <span className="text-sm font-medium">{section.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation() }}>
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation() }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </button>

                        {isExpanded && section.lessons.length > 0 && (
                          <div className="border-t border-border">
                            {section.lessons
                              .sort((a, b) => a.order - b.order)
                              .map((lesson) => {
                                const LessonIcon = lessonTypeIcons[lesson.type] || FileText
                                return (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between px-4 py-3 pl-14 border-b last:border-0 border-border hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
                                      <LessonIcon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{lesson.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      {lesson.duration && (
                                        <span>{Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, "0")}</span>
                                      )}
                                      <span className="capitalize rounded bg-muted px-1.5 py-0.5 font-medium">{lesson.type}</span>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        )}

                        {isExpanded && section.lessons.length === 0 && (
                          <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
                            No lessons in this section.{" "}
                            <button className="text-primary hover:underline">Add a lesson</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === "students" && (
          <div className="rounded-[var(--radius-card)] border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="text-subheading">Enrolled Students ({course.enrolledStudents})</h3>
            </div>
            {course.enrolledStudents === 0 ? (
              <EmptyState
                icon={Users}
                title="No students enrolled"
                description="Students will appear here once they enroll in this course."
              />
            ) : (
              <div className="p-5 text-sm text-muted-foreground">
                Student enrollment data will be loaded from the enrollment API.
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
              <h3 className="text-subheading">Visibility & Access</h3>
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4">
                <div>
                  <p className="text-sm font-medium">Course Visibility</p>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{course.visibility}</p>
                </div>
                <StatusBadge status={course.visibility === "public" ? "active" : "inactive"} />
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
              <h3 className="text-subheading">SEO</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">SEO Title</p>
                  <p className="font-medium mt-0.5">{course.seoTitle || "Not set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">SEO Description</p>
                  <p className="font-medium mt-0.5">{course.seoDescription || "Not set"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
              <h3 className="text-subheading text-destructive">Danger Zone</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Archive this course</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Hide from students but keep data</p>
                </div>
                <Button variant="outline" size="sm">Archive</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Delete this course</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Permanently delete course and all data</p>
                </div>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive destructive-glow">Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
