"use client"

import * as React from "react"
import { useApi, useMutation } from "@/hooks/use-api"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus } from "lucide-react"
import { SectionList } from "./section-list"

export interface LessonData {
  id: string
  title: string
  type: string
  order: number
  sectionId: string
  duration: number | null
}

export interface SectionData {
  id: string
  title: string
  order: number
  lessons: LessonData[]
}

interface CurriculumTabProps {
  courseId: string
}

export function CurriculumTab({ courseId }: CurriculumTabProps) {
  const { data, loading, error, refetch } = useApi<{ sections: SectionData[] }>({
    url: `/api/instructor/courses/${courseId}/curriculum`,
  })

  const { mutate: createSection, loading: creating } = useMutation({
    onSuccess: () => refetch(),
  })

  const [newSectionTitle, setNewSectionTitle] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionTitle.trim()) return

    try {
      await createSection(`/api/instructor/courses/${courseId}/curriculum`, {
        method: "POST",
        body: JSON.stringify({ title: newSectionTitle }),
      })
      setNewSectionTitle("")
      setIsAdding(false)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[var(--radius-card)] skeleton-shimmer" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState description={error} onRetry={refetch} />
  }

  const sections = data?.sections || []

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Curriculum</h3>
          <p className="text-sm text-muted-foreground">
            Manage your course sections and lessons
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        )}
      </div>

      <SectionList courseId={courseId} sections={sections} onUpdate={refetch} />

      {isAdding && (
        <form
          onSubmit={handleAddSection}
          className="rounded-[var(--radius-card)] border border-border bg-card p-4 space-y-4 animate-in fade-in slide-in-from-top-4"
        >
          <div>
            <label className="text-sm font-medium mb-1.5 block">Section Title</label>
            <Input
              autoFocus
              placeholder="e.g. Introduction to Next.js"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="input-focus-ring"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAdding(false)
                setNewSectionTitle("")
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!newSectionTitle.trim() || creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Section"}
            </Button>
          </div>
        </form>
      )}

      {sections.length === 0 && !isAdding && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center bg-muted/20">
          <p className="text-sm text-muted-foreground mb-4">
            Your curriculum is empty. Start by adding a section.
          </p>
          <Button onClick={() => setIsAdding(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Section
          </Button>
        </div>
      )}
    </div>
  )
}
