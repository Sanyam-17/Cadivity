"use client"

import * as React from "react"
import { useApi, useMutation } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { QuizBuilder } from "./quiz-builder"
import { Loader2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface LessonEditorProps {
  courseId: string
  sectionId: string
  lessonId: string
  onClose: () => void
  onSaved: () => void
}

export function LessonEditor({
  courseId,
  sectionId,
  lessonId,
  onClose,
  onSaved,
}: LessonEditorProps) {
  const { data: lesson, loading } = useApi<any>({
    url: `/api/instructor/courses/${courseId}/curriculum/${sectionId}/lessons/${lessonId}`,
  })

  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState<any>(null)
  const [isDirty, setIsDirty] = React.useState(false)

  React.useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      const base =
        lesson.content || (lesson.type === "quiz" ? { questions: [] } : {})
      if (lesson.type === "video" && !base.videoUrl && lesson.youtubeVideoId) {
        setContent({ ...base, videoUrl: lesson.youtubeVideoId })
      } else {
        setContent(base)
      }
    }
  }, [lesson])

  const { mutate: saveLesson, loading: saving } = useMutation({
    onSuccess: () => {
      toast.success("Lesson saved")
      onSaved()
      onClose()
    },
    onError: () => toast.error("Failed to save lesson"),
  })

  const handleSave = async () => {
    // Basic validation
    if (lesson?.type === "video" && (!content?.videoUrl || !content.videoUrl.startsWith("http"))) {
      toast.error("Valid video URL is required")
      return
    }

    await saveLesson(
      `/api/instructor/courses/${courseId}/curriculum/${sectionId}/lessons/${lessonId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ title, content }),
      }
    )
  }

  if (loading || !lesson) {
    return (
      <div className="rounded-md border border-border bg-card p-4 flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-primary/20 bg-card p-4 space-y-4 shadow-sm my-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Edit {lesson.type} Lesson</h4>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setIsDirty(true)
            }}
            className="input-focus-ring"
          />
        </div>

        {lesson.type === "video" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Video URL (YouTube/Vimeo)</label>
            <Input
              value={content?.videoUrl || ""}
              onChange={(e) => {
                setContent({ ...content, videoUrl: e.target.value })
                setIsDirty(true)
              }}
              placeholder="https://..."
              className="input-focus-ring"
            />
          </div>
        )}

        {lesson.type === "text" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Text Content</label>
            <Textarea
              value={content?.text || ""}
              onChange={(e) => {
                setContent({ ...content, text: e.target.value })
                setIsDirty(true)
              }}
              rows={6}
              className="input-focus-ring resize-y"
              placeholder="Write your lesson content here..."
            />
          </div>
        )}

        {lesson.type === "quiz" && (
          <QuizBuilder
            content={content}
            onChange={(newContent) => {
              setContent(newContent)
              setIsDirty(true)
            }}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!isDirty || saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  )
}
