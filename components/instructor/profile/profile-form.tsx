"use client"

import * as React from "react"
import { useApi, useMutation } from "@/hooks/use-api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Camera } from "lucide-react"
import { toast } from "sonner"

interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  role: string
}

export function ProfileForm() {
  const { data: profile, loading, refetch } = useApi<ProfileData>({
    url: "/api/instructor/profile",
  })

  const [name, setName] = React.useState("")
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)
  const [isDirty, setIsDirty] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (profile) {
      setName(profile.name)
      setIsDirty(false)
    }
  }, [profile])

  const { mutate, loading: saving } = useMutation({
    onSuccess: () => {
      toast.success("Profile updated")
      setIsDirty(false)
      refetch()
    },
    onError: (msg) => toast.error(msg || "Failed to update profile"),
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreview(reader.result as string)
        setIsDirty(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    mutate("/api/instructor/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name,
        ...(photoPreview ? { image: photoPreview } : {}),
      }),
    })
  }

  const initials = (profile?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  if (loading) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-4">
        <div className="h-5 w-32 rounded skeleton-shimmer" />
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded skeleton-shimmer" />
            <div className="h-4 w-48 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-6">
      <h3 className="text-sm font-semibold">Personal Information</h3>

      {/* Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={photoPreview || profile?.image || ""} alt={profile?.name || ""} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
        <div>
          <p className="text-sm font-medium">{profile?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Display Name</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setIsDirty(true)
            }}
            className="input-focus-ring"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Email</Label>
          <Input value={profile?.email || ""} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed from here.
          </p>
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
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
