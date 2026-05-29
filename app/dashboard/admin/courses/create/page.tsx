"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/admin/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { useApi, useMutation } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  X,
  Upload,
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
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  courseCount: number
}

interface Instructor {
  id: string
  name: string
  email: string
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export default function CreateCoursePage() {
  const router = useRouter()

  const [form, setForm] = React.useState({
    title: "",
    slug: "",
    description: "",
    instructorId: "",
    categoryId: "",
    status: "draft",
  })
  const [autoSlug, setAutoSlug] = React.useState(true)

  const { data: categories } = useApi<Category[]>({
    url: "/api/admin/categories",
  })

  const { data: instructorsRes } = useApi<{ data: Instructor[] }>({
    url: "/api/admin/instructors",
    params: { pageSize: 100 },
  })

  const { mutate, loading: saving } = useMutation({
    onSuccess: (data) => {
      toast.success("Course created successfully")
      router.push(`/admin/courses/${data.id}`)
    },
    onError: (err) => toast.error(err),
  })

  const handleTitleChange = (value: string) => {
    setForm((f) => ({
      ...f,
      title: value,
      slug: autoSlug ? generateSlug(value) : f.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required")
      return
    }

    await mutate("/api/admin/courses", {
      method: "POST",
      body: JSON.stringify({
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        instructorId: form.instructorId || null,
        categoryId: form.categoryId || null,
        status: form.status,
      }),
    })
  }

  const instructors = instructorsRes?.data || []

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title="Create Course" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
            <h3 className="text-subheading">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. AutoCAD Fundamentals"
                className="input-focus-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">URL Slug</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    setAutoSlug(!autoSlug)
                    if (!autoSlug) {
                      setForm((f) => ({
                        ...f,
                        slug: generateSlug(f.title),
                      }))
                    }
                  }}
                >
                  {autoSlug ? "Edit manually" : "Auto-generate"}
                </button>
              </div>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                disabled={autoSlug}
                className={cn("input-focus-ring", autoSlug && "opacity-60")}
                placeholder="autocad-fundamentals"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="A comprehensive course covering..."
                className="min-h-[120px] input-focus-ring resize-none"
              />
            </div>

            {/* Thumbnail Upload Zone */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:border-primary/40 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">
                    Drag & drop or click to upload
                  </span>
                  <span className="text-xs">PNG, JPG up to 2MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Settings */}
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
            <h3 className="text-subheading">Settings</h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Select
                  value={form.instructorId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, instructorId: v }))
                  }
                >
                  <SelectTrigger className="input-focus-ring">
                    <SelectValue placeholder="Assign an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, categoryId: v }))
                  }
                >
                  <SelectTrigger className="input-focus-ring">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories || []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4">
              <div>
                <p className="text-sm font-medium">Publish immediately</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Make this course visible to students right away
                </p>
              </div>
              <Switch
                checked={form.status === "published"}
                onCheckedChange={(checked) =>
                  setForm((f) => ({
                    ...f,
                    status: checked ? "published" : "draft",
                  }))
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  form.status === "published"
                    ? "bg-success"
                    : "bg-warning"
                )}
              />
              <span className="text-sm text-muted-foreground capitalize">
                {form.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

