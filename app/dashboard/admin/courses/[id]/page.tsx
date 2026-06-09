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
  CreditCard,
  Upload,
  X,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import Link from "next/link"
import { PublicCourseCard, type PublicCourse } from "@/components/layout/public-course-card"

interface CourseDetail {
  id: string
  title: string
  slug: string
  description: string | null
  shortDescription: string | null
  thumbnail: string | null
  logo: string | null
  difficultyBadge: string | null
  tags: string | null
  keyFeatures: string[]
  ctaType: string
  brochureUrl: string | null
  price: number | null
  originalPrice: number | null
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
  whatYouWillLearn: string[]
  requirements: string[]
  whoIsThisFor: string[]
  enrolledStudents: number
  sectionCount: number
  createdAt: string
  updatedAt: string
}

type TabId = "overview" | "card" | "landing" | "curriculum" | "students" | "settings"

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "card", label: "Card Content", icon: CreditCard },
  { id: "landing", label: "Landing Page", icon: FileText },
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

  const handleAddSection = async () => {
    const title = window.prompt("Section title")
    if (!title?.trim()) return
    try {
      await mutate("/api/admin/sections", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), courseId }),
      })
      toast.success("Section created")
      refetch()
    } catch {
      /* toast from useMutation */
    }
  }

  const handleAddLesson = async (sectionId: string) => {
    const title = window.prompt("Lesson title")
    if (!title?.trim()) return
    try {
      await mutate("/api/admin/lessons", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), sectionId, type: "video" }),
      })
      toast.success("Lesson created")
      refetch()
    } catch {
      /* toast from useMutation */
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Delete this section and all its lessons?")) return
    try {
      await mutate(`/api/admin/sections/${sectionId}`, { method: "DELETE" })
      toast.success("Section deleted")
      refetch()
    } catch {
      /* toast from useMutation */
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm("Delete this lesson?")) return
    try {
      await mutate(`/api/admin/lessons/${lessonId}`, { method: "DELETE" })
      toast.success("Lesson deleted")
      refetch()
    } catch {
      /* toast from useMutation */
    }
  }

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
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
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

        {/* ─── Card Content Tab ─── */}
        {activeTab === "card" && (
          <CardContentTab course={course} courseId={courseId} onSave={refetch} />
        )}

        {/* ─── Landing Page Tab ─── */}
        {activeTab === "landing" && (
          <LandingPageTab course={course} courseId={courseId} onSave={refetch} />
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
                <Button size="sm" type="button" onClick={handleAddSection}>
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
                onAction={handleAddSection}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                void handleAddLesson(section.id)
                              }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                void handleDeleteSection(section.id)
                              }}
                            >
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
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive"
                                        type="button"
                                        onClick={() => void handleDeleteLesson(lesson.id)}
                                      >
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
                            <button
                              type="button"
                              className="text-primary hover:underline"
                              onClick={() => void handleAddLesson(section.id)}
                            >
                              Add a lesson
                            </button>
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

// ─── Card Content Tab (Inline Edit + Preview) ───────────────────────────────

function CardContentTab({
  course,
  courseId,
  onSave,
}: {
  course: CourseDetail
  courseId: string
  onSave: () => void
}) {
  const [form, setForm] = React.useState({
    shortDescription: course.shortDescription || "",
    logo: course.logo || "",
    difficultyBadge: course.difficultyBadge || "",
    tags: course.tags || "",
    keyFeatures: course.keyFeatures?.length > 0 ? course.keyFeatures : [""],
    ctaType: course.ctaType || "enroll_now",
    brochureUrl: course.brochureUrl || "",
    price: course.price != null ? String(course.price) : "",
    originalPrice: course.originalPrice != null ? String(course.originalPrice) : "",
  })
  const [dirty, setDirty] = React.useState(false)

  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const brochureInputRef = React.useRef<HTMLInputElement>(null)

  const { mutate, loading: saving } = useMutation({
    onSuccess: () => {
      toast.success("Card content saved")
      setDirty(false)
      onSave()
    },
    onError: (err) => toast.error(err),
  })

  const updateForm = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateForm("logo", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Brochure upload
  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Brochure must be under 10MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateForm("brochureUrl", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Key features
  const addFeature = () => {
    if (form.keyFeatures.length >= 6) return
    updateForm("keyFeatures", [...form.keyFeatures, ""])
  }

  const removeFeature = (idx: number) => {
    updateForm("keyFeatures", form.keyFeatures.filter((_, i) => i !== idx))
  }

  const updateFeature = (idx: number, value: string) => {
    const updated = form.keyFeatures.map((f, i) => (i === idx ? value : f))
    updateForm("keyFeatures", updated)
  }

  const handleSave = async () => {
    const cleanedFeatures = form.keyFeatures.filter((f) => f.trim() !== "")
    await mutate(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify({
        shortDescription: form.shortDescription.trim() || null,
        logo: form.logo || null,
        difficultyBadge: form.difficultyBadge || null,
        tags: form.tags.trim() || null,
        keyFeatures: cleanedFeatures,
        ctaType: form.ctaType,
        brochureUrl: form.brochureUrl || null,
        price: form.price ? parseInt(form.price, 10) : null,
        originalPrice: form.originalPrice ? parseInt(form.originalPrice, 10) : null,
      }),
    })
  }

  // Preview data
  const previewCourse: PublicCourse = {
    id: courseId,
    title: course.title,
    slug: course.slug,
    shortDescription: form.shortDescription || null,
    logo: form.logo || null,
    difficultyBadge: form.difficultyBadge || null,
    tags: form.tags || null,
    keyFeatures: form.keyFeatures.filter((f) => f.trim() !== ""),
    ctaType: form.ctaType,
    brochureUrl: form.brochureUrl || null,
    price: form.price ? parseInt(form.price, 10) : null,
    originalPrice: form.originalPrice ? parseInt(form.originalPrice, 10) : null,
    thumbnail: null,
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* ─── Edit Form ─── */}
      <div className="space-y-6">
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
          <h3 className="text-subheading">Card Content</h3>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Software Logo / Icon</Label>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            {form.logo ? (
              <div className="relative inline-block">
                <img src={form.logo} alt="Logo" className="h-20 object-contain rounded-lg border border-border bg-slate-50 p-2" />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={() => updateForm("logo", "")}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:border-primary/40 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => logoInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs font-medium">Upload logo (PNG, JPG — max 2MB)</span>
                </div>
              </div>
            )}
          </div>

          {/* Difficulty Badge */}
          <div className="space-y-2">
            <Label>Difficulty Badge</Label>
            <Select value={form.difficultyBadge} onValueChange={(v) => updateForm("difficultyBadge", v)}>
              <SelectTrigger className="input-focus-ring">
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner/Inter">Beginner/Inter</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tech Stack / Language Tags</Label>
            <Input
              id="edit-tags"
              value={form.tags}
              onChange={(e) => updateForm("tags", e.target.value)}
              placeholder='e.g. C++, C# / VB.NET'
              className="input-focus-ring"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-shortDesc">Short Description</Label>
              <span className={cn("text-xs tabular-nums", form.shortDescription.length > 120 ? "text-destructive font-medium" : "text-muted-foreground")}>
                {form.shortDescription.length}/120
              </span>
            </div>
            <Textarea
              id="edit-shortDesc"
              value={form.shortDescription}
              onChange={(e) => updateForm("shortDescription", e.target.value.slice(0, 120))}
              placeholder="Brief description shown on the card (2-3 lines)"
              className="min-h-[80px] input-focus-ring resize-none"
              maxLength={120}
            />
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Key Features</Label>
              <span className="text-xs text-muted-foreground">{form.keyFeatures.filter((f) => f.trim()).length}/6</span>
            </div>
            <div className="space-y-2">
              {form.keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-green-500 text-sm shrink-0">✓</span>
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder={`Feature ${idx + 1}`}
                    className="input-focus-ring"
                  />
                  {form.keyFeatures.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeFeature(idx)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {form.keyFeatures.length < 6 && (
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addFeature}>
                <Plus className="h-3.5 w-3.5" />
                Add Feature
              </Button>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
          <h3 className="text-subheading">Pricing & Call-to-Action</h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₹ INR)</Label>
              <Input id="edit-price" type="number" min="0" value={form.price} onChange={(e) => updateForm("price", e.target.value)} placeholder="e.g. 14999" className="input-focus-ring" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-originalPrice">Original Price (₹ INR) <span className="text-muted-foreground font-normal">— strikethrough</span></Label>
              <Input id="edit-originalPrice" type="number" min="0" value={form.originalPrice} onChange={(e) => updateForm("originalPrice", e.target.value)} placeholder="e.g. 24999" className="input-focus-ring" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>CTA Button Type</Label>
            <Select value={form.ctaType} onValueChange={(v) => updateForm("ctaType", v)}>
              <SelectTrigger className="input-focus-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enroll_now">Enroll Now</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
                <SelectItem value="contact_us">Contact Us</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brochure */}
          <div className="space-y-2">
            <Label>Brochure PDF</Label>
            <input ref={brochureInputRef} type="file" accept=".pdf" className="hidden" onChange={handleBrochureUpload} />
            {form.brochureUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Brochure uploaded</p>
                  <p className="text-xs text-muted-foreground">PDF ready for download</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => updateForm("brochureUrl", "")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:border-primary/40 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => brochureInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs font-medium">Upload PDF (max 10MB)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end rounded-[var(--radius-card)] border border-border bg-card p-5">
          <Button onClick={handleSave} disabled={saving || !dirty}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Card Content"}
          </Button>
        </div>
      </div>

      {/* ─── Live Preview ─── */}
      <div className="hidden lg:block">
        <div className="sticky top-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Eye className="h-4 w-4" />
            Card Preview
          </div>
          <div className="max-w-[360px]">
            <PublicCourseCard course={previewCourse} isPreview />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Landing Page Content Tab (Edit Description, Outcomes, Requirements, Audience) ───

function LandingPageTab({
  course,
  courseId,
  onSave,
}: {
  course: CourseDetail
  courseId: string
  onSave: () => void
}) {
  const [form, setForm] = React.useState({
    description: course.description || "",
    whatYouWillLearn: course.whatYouWillLearn?.length > 0 ? course.whatYouWillLearn : [""],
    requirements: course.requirements?.length > 0 ? course.requirements : [""],
    whoIsThisFor: course.whoIsThisFor?.length > 0 ? course.whoIsThisFor : [""],
  })
  const [dirty, setDirty] = React.useState(false)

  const { mutate, loading: saving } = useMutation({
    onSuccess: () => {
      toast.success("Landing page content saved")
      setDirty(false)
      onSave()
    },
    onError: (err) => toast.error(err),
  })

  const updateForm = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  // Learning Outcomes
  const addOutcome = () => {
    updateForm("whatYouWillLearn", [...form.whatYouWillLearn, ""])
  }
  const removeOutcome = (idx: number) => {
    updateForm("whatYouWillLearn", form.whatYouWillLearn.filter((_, i) => i !== idx))
  }
  const updateOutcome = (idx: number, value: string) => {
    updateForm("whatYouWillLearn", form.whatYouWillLearn.map((f, i) => (i === idx ? value : f)))
  }

  // Requirements
  const addRequirement = () => {
    updateForm("requirements", [...form.requirements, ""])
  }
  const removeRequirement = (idx: number) => {
    updateForm("requirements", form.requirements.filter((_, i) => i !== idx))
  }
  const updateRequirement = (idx: number, value: string) => {
    updateForm("requirements", form.requirements.map((f, i) => (i === idx ? value : f)))
  }

  // Who is this for
  const addAudience = () => {
    updateForm("whoIsThisFor", [...form.whoIsThisFor, ""])
  }
  const removeAudience = (idx: number) => {
    updateForm("whoIsThisFor", form.whoIsThisFor.filter((_, i) => i !== idx))
  }
  const updateAudience = (idx: number, value: string) => {
    updateForm("whoIsThisFor", form.whoIsThisFor.map((f, i) => (i === idx ? value : f)))
  }

  const handleSave = async () => {
    const cleanedOutcomes = form.whatYouWillLearn.filter((f) => f.trim() !== "")
    const cleanedRequirements = form.requirements.filter((f) => f.trim() !== "")
    const cleanedAudience = form.whoIsThisFor.filter((f) => f.trim() !== "")

    await mutate(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify({
        description: form.description.trim() || null,
        whatYouWillLearn: cleanedOutcomes,
        requirements: cleanedRequirements,
        whoIsThisFor: cleanedAudience,
      }),
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Description */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
        <h3 className="text-subheading">Course Description</h3>
        <div className="space-y-2">
          <Label htmlFor="edit-desc">Full Long Description</Label>
          <Textarea
            id="edit-desc"
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            placeholder="Detailed course description visible on the public landing page..."
            className="min-h-[150px] input-focus-ring resize-none"
          />
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-subheading">What You'll Learn</h3>
          <span className="text-xs text-muted-foreground">{form.whatYouWillLearn.filter(f => f.trim()).length} outcomes</span>
        </div>
        <div className="space-y-2">
          {form.whatYouWillLearn.map((outcome, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-green-500 text-sm shrink-0">✓</span>
              <Input
                value={outcome}
                onChange={(e) => updateOutcome(idx, e.target.value)}
                placeholder={`Learning Outcome ${idx + 1}`}
                className="input-focus-ring"
              />
              {form.whatYouWillLearn.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeOutcome(idx)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addOutcome}>
          <Plus className="h-3.5 w-3.5" />
          Add Learning Outcome
        </Button>
      </div>

      {/* Prerequisites / Requirements */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-subheading">Prerequisites & Requirements</h3>
          <span className="text-xs text-muted-foreground">{form.requirements.filter(f => f.trim()).length} requirements</span>
        </div>
        <div className="space-y-2">
          {form.requirements.map((req, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-primary text-sm shrink-0">·</span>
              <Input
                value={req}
                onChange={(e) => updateRequirement(idx, e.target.value)}
                placeholder={`Prerequisite ${idx + 1}`}
                className="input-focus-ring"
              />
              {form.requirements.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeRequirement(idx)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addRequirement}>
          <Plus className="h-3.5 w-3.5" />
          Add Prerequisite
        </Button>
      </div>

      {/* Who is this for */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-subheading">Who Is This Course For</h3>
          <span className="text-xs text-muted-foreground">{form.whoIsThisFor.filter(f => f.trim()).length} target audiences</span>
        </div>
        <div className="space-y-2">
          {form.whoIsThisFor.map((aud, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-primary text-sm shrink-0">→</span>
              <Input
                value={aud}
                onChange={(e) => updateAudience(idx, e.target.value)}
                placeholder={`Target Audience ${idx + 1}`}
                className="input-focus-ring"
              />
              {form.whoIsThisFor.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeAudience(idx)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addAudience}>
          <Plus className="h-3.5 w-3.5" />
          Add Target Audience
        </Button>
      </div>

      {/* Save Bar */}
      <div className="flex items-center justify-end rounded-[var(--radius-card)] border border-border bg-card p-5">
        <Button onClick={handleSave} disabled={saving || !dirty}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Landing Page Details"}
        </Button>
      </div>
    </div>
  )
}
