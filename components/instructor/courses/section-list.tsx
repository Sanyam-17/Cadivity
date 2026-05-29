"use client"

import * as React from "react"
import { useMutation } from "@/hooks/use-api"
import { SectionData } from "./curriculum-tab"
import { LessonRow } from "./lesson-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GripVertical,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SectionListProps {
  courseId: string
  sections: SectionData[]
  onUpdate: () => void
}

export function SectionList({ courseId, sections, onUpdate }: SectionListProps) {
  // Simplified without DnD to avoid complexity for now.
  // In a real app we'd use @dnd-kit/core here to sort sections and lessons.

  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>(
    sections.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  )

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const { mutate: updateSection } = useMutation({ onSuccess: onUpdate })
  const { mutate: deleteSection } = useMutation({
    onSuccess: () => {
      toast.success("Section deleted")
      onUpdate()
    },
  })
  const { mutate: createLesson } = useMutation({ onSuccess: onUpdate })

  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState("")

  const handleSaveTitle = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingSectionId(null)
      return
    }
    await updateSection(`/api/instructor/courses/${courseId}/curriculum/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: editTitle }),
    })
    setEditingSectionId(null)
  }

  const handleDeleteSection = async (id: string) => {
    if (confirm("Are you sure? This will delete all lessons inside.")) {
      await deleteSection(`/api/instructor/courses/${courseId}/curriculum/${id}`, {
        method: "DELETE",
      })
    }
  }

  const handleAddLesson = async (sectionId: string, type: string) => {
    await createLesson(`/api/instructor/courses/${courseId}/curriculum/${sectionId}/lessons`, {
      method: "POST",
      body: JSON.stringify({ title: "New Lesson", type }),
    })
    setExpandedSections((prev) => ({ ...prev, [sectionId]: true }))
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const isExpanded = expandedSections[section.id]
        const isEditing = editingSectionId === section.id

        return (
          <div key={section.id} className="rounded-[var(--radius-card)] border border-border bg-card">
            {/* Section Header */}
            <div className="flex items-center gap-3 p-4 bg-muted/30 border-b border-border">
              <button className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
              </button>

              <button
                onClick={() => toggleSection(section.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              <div className="flex-1 font-medium text-sm">
                <span className="text-muted-foreground mr-2">Section {index + 1}:</span>
                {isEditing ? (
                  <Input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveTitle(section.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTitle(section.id)}
                    className="h-7 w-64 inline-flex"
                  />
                ) : (
                  <span>{section.title}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAddLesson(section.id, "video")}>
                      <Video className="mr-2 h-4 w-4" /> Add Video
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddLesson(section.id, "text")}>
                      <FileText className="mr-2 h-4 w-4" /> Add Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddLesson(section.id, "quiz")}>
                      <HelpCircle className="mr-2 h-4 w-4" /> Add Quiz
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditTitle(section.title)
                        setEditingSectionId(section.id)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Lessons */}
            {isExpanded && (
              <div className={cn("p-2", section.lessons.length === 0 && "p-6 text-center")}>
                {section.lessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No lessons yet. Click the + icon to add one.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {section.lessons.map((lesson) => (
                      <LessonRow
                        key={lesson.id}
                        courseId={courseId}
                        sectionId={section.id}
                        lesson={lesson}
                        onUpdate={onUpdate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
