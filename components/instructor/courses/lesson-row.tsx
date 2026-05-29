"use client"

import * as React from "react"
import { LessonData } from "./curriculum-tab"
import { useMutation } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  Video,
  FileText,
  HelpCircle,
} from "lucide-react"
import { toast } from "sonner"
import { LessonEditor } from "./lesson-editor"

interface LessonRowProps {
  courseId: string
  sectionId: string
  lesson: LessonData
  onUpdate: () => void
}

const typeIcons = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
}

export function LessonRow({ courseId, sectionId, lesson, onUpdate }: LessonRowProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const { mutate: deleteLesson } = useMutation({
    onSuccess: () => {
      toast.success("Lesson deleted")
      onUpdate()
    },
  })

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      await deleteLesson(
        `/api/instructor/courses/${courseId}/curriculum/${sectionId}/lessons/${lesson.id}`,
        { method: "DELETE" }
      )
    }
  }

  const Icon = typeIcons[lesson.type as keyof typeof typeIcons] || FileText

  if (isEditing) {
    return (
      <LessonEditor
        courseId={courseId}
        sectionId={sectionId}
        lessonId={lesson.id}
        onClose={() => setIsEditing(false)}
        onSaved={onUpdate}
      />
    )
  }

  return (
    <div className="group flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors">
      <button className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{lesson.title}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
