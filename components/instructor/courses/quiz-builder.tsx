"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, GripVertical, CheckCircle2, Circle } from "lucide-react"

interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctOptionIndex: number
}

interface QuizBuilderProps {
  content: { questions?: QuizQuestion[] }
  onChange: (content: { questions: QuizQuestion[] }) => void
}

export function QuizBuilder({ content, onChange }: QuizBuilderProps) {
  const questions = content?.questions || []

  const handleAddQuestion = () => {
    onChange({
      questions: [
        ...questions,
        {
          id: crypto.randomUUID(),
          text: "",
          options: ["Option 1", "Option 2"],
          correctOptionIndex: 0,
        },
      ],
    })
  }

  const handleUpdateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    onChange({ questions: newQuestions })
  }

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = [...questions]
    newQuestions.splice(index, 1)
    onChange({ questions: newQuestions })
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={q.id} className="rounded-md border border-border p-4 space-y-4 bg-muted/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Question {qIndex + 1}</label>
              <Input
                value={q.text}
                onChange={(e) => handleUpdateQuestion(qIndex, { text: e.target.value })}
                placeholder="What is..."
                className="input-focus-ring bg-card"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mt-5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDeleteQuestion(qIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 pl-2 border-l-2 border-border ml-2">
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateQuestion(qIndex, { correctOptionIndex: oIndex })}
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                >
                  {q.correctOptionIndex === oIndex ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>
                <Input
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...q.options]
                    newOptions[oIndex] = e.target.value
                    handleUpdateQuestion(qIndex, { options: newOptions })
                  }}
                  className="h-8 input-focus-ring bg-card"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    const newOptions = [...q.options]
                    newOptions.splice(oIndex, 1)
                    // adjust correct option index if needed
                    let newCorrect = q.correctOptionIndex
                    if (q.correctOptionIndex === oIndex) newCorrect = 0
                    else if (q.correctOptionIndex > oIndex) newCorrect--
                    handleUpdateQuestion(qIndex, { options: newOptions, correctOptionIndex: newCorrect })
                  }}
                  disabled={q.options.length <= 2}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 ml-6 text-muted-foreground"
              onClick={() => {
                const newOptions = [...q.options, `Option ${q.options.length + 1}`]
                handleUpdateQuestion(qIndex, { options: newOptions })
              }}
            >
              <Plus className="h-3 w-3" /> Add Option
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={handleAddQuestion}>
        <Plus className="h-4 w-4" /> Add Question
      </Button>
    </div>
  )
}
