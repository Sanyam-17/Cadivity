"use client"

import * as React from "react"
import { useApi, useMutation } from "@/hooks/use-api"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Lock, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

interface CourseSettings {
  id: string
  title: string
  status: string
  completionCriteria: string
  seoTitle: string | null
  seoDescription: string | null
}

interface SettingsTabProps {
  courseId: string
}

export function SettingsTab({ courseId }: SettingsTabProps) {
  const { data: course, loading, error, refetch } = useApi<CourseSettings>({
    url: `/api/instructor/courses/${courseId}`,
  })

  const [formState, setFormState] = React.useState({
    status: "",
    completionCriteria: "",
    seoTitle: "",
    seoDescription: "",
  })
  const [isDirty, setIsDirty] = React.useState(false)

  // Sync form state when data loads
  React.useEffect(() => {
    if (course) {
      setFormState({
        status: course.status,
        completionCriteria: course.completionCriteria,
        seoTitle: course.seoTitle || "",
        seoDescription: course.seoDescription || "",
      })
      setIsDirty(false)
    }
  }, [course])

  const { mutate, loading: saving } = useMutation({
    onSuccess: () => {
      toast.success("Settings saved")
      setIsDirty(false)
      refetch()
    },
    onError: (msg) => {
      toast.error(msg || "Save failed, try again")
    },
  })

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = () => {
    mutate(`/api/instructor/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(formState),
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
            <div className="h-4 w-32 rounded skeleton-shimmer" />
            <div className="h-10 w-full rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !course) {
    return <ErrorState description={error || "Course not found"} onRetry={refetch} />
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-2xl">
        {/* Status */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold">Course Status</h3>
          <div className="flex items-center gap-3">
            <Switch
              checked={formState.status === "published"}
              onCheckedChange={(checked) =>
                handleChange("status", checked ? "published" : "draft")
              }
            />
            <span className="text-sm font-medium">
              {formState.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        {/* Completion Criteria */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold">Completion Criteria</h3>
          <Select
            value={formState.completionCriteria}
            onValueChange={(val) => handleChange("completionCriteria", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_videos">Watch all videos</SelectItem>
              <SelectItem value="all_quizzes">Pass all quizzes</SelectItem>
              <SelectItem value="manual">Manual completion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Admin-controlled fields (locked) */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold">Admin-Managed Settings</h3>
          <div className="space-y-4 opacity-60">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Course Title</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This setting is managed by your admin</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input value={course.title} disabled className="bg-muted" />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold">SEO</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">SEO Title</Label>
                <span className="text-xs text-muted-foreground">
                  {formState.seoTitle.length}/60
                </span>
              </div>
              <Input
                value={formState.seoTitle}
                onChange={(e) => handleChange("seoTitle", e.target.value)}
                maxLength={60}
                placeholder="Enter SEO title..."
                className="input-focus-ring"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Meta Description</Label>
                <span className="text-xs text-muted-foreground">
                  {formState.seoDescription.length}/160
                </span>
              </div>
              <Textarea
                value={formState.seoDescription}
                onChange={(e) => handleChange("seoDescription", e.target.value)}
                maxLength={160}
                placeholder="Enter meta description..."
                className="input-focus-ring resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
