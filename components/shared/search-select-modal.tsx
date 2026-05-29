"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, X, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

interface SelectOption {
  id: string
  label: string
  sublabel?: string
  image?: string
}

interface SearchSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  options: SelectOption[]
  selected: string[]
  onConfirm: (selected: string[]) => void
  multiSelect?: boolean
  loading?: boolean
  searchPlaceholder?: string
}

export function SearchSelectModal({
  open,
  onOpenChange,
  title,
  options,
  selected: initialSelected,
  onConfirm,
  multiSelect = false,
  loading = false,
  searchPlaceholder = "Search...",
}: SearchSelectModalProps) {
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<string[]>(initialSelected)

  React.useEffect(() => {
    if (open) {
      setSelected(initialSelected)
      setSearch("")
    }
  }, [open, initialSelected])

  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.sublabel?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (id: string) => {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      )
    } else {
      setSelected([id])
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-backdrop-enter"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-modal)] bg-card shadow-xl animate-modal-enter flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-0"
              autoFocus
            />
          </div>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((option) => {
                const isSelected = selected.includes(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-primary/5 border border-primary/20"
                        : "hover:bg-muted border border-transparent"
                    )}
                  >
                    {multiSelect ? (
                      <Checkbox checked={isSelected} className="shrink-0" />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center shrink-0">
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    )}
                    {option.image !== undefined && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={option.image} />
                        <AvatarFallback className="text-xs bg-muted">
                          {option.label
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {option.label}
                      </p>
                      {option.sublabel && (
                        <p className="text-xs text-muted-foreground truncate">
                          {option.sublabel}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(selected)
              onOpenChange(false)
            }}
            disabled={selected.length === 0 || loading}
          >
            {loading
              ? "Saving..."
              : `Confirm${selected.length > 0 ? ` (${selected.length})` : ""}`}
          </Button>
        </div>
      </div>
    </>
  )
}
