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
  Upload,
  Plus,
  X,
  FileText,
  Eye,
  EyeOff,
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
import { PublicCourseCard, type PublicCourse } from "@/components/layout/public-course-card"

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
  const [showPreview, setShowPreview] = React.useState(true)

  const [form, setForm] = React.useState({
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    logo: "" as string,
    difficultyBadge: "",
    tags: "",
    keyFeatures: [""] as string[],
    ctaType: "enroll_now",
    brochureUrl: "" as string,
    price: "",
    originalPrice: "",
    instructorId: "",
    categoryId: "",
    status: "draft",
    whatYouWillLearn: [""] as string[],
    requirements: [""] as string[],
    whoIsThisFor: [""] as string[],
  })
  const [autoSlug, setAutoSlug] = React.useState(true)

  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const brochureInputRef = React.useRef<HTMLInputElement>(null)

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

  // ─── Logo Upload ───
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, logo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  // ─── Brochure PDF Upload ───
  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Brochure must be under 10MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, brochureUrl: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  // ─── Key Features ───
  const addFeature = () => {
    if (form.keyFeatures.length >= 6) {
      toast.error("Maximum 6 key features allowed")
      return
    }
    setForm((f) => ({ ...f, keyFeatures: [...f.keyFeatures, ""] }))
  }

  const removeFeature = (index: number) => {
    setForm((f) => ({
      ...f,
      keyFeatures: f.keyFeatures.filter((_, i) => i !== index),
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      keyFeatures: f.keyFeatures.map((feat, i) => (i === index ? value : feat)),
    }))
  }

  // ─── What You'll Learn ───
  const addWhatLearn = () => {
    setForm((f) => ({ ...f, whatYouWillLearn: [...f.whatYouWillLearn, ""] }))
  }
  const removeWhatLearn = (index: number) => {
    setForm((f) => ({
      ...f,
      whatYouWillLearn: f.whatYouWillLearn.filter((_, i) => i !== index),
    }))
  }
  const updateWhatLearn = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      whatYouWillLearn: f.whatYouWillLearn.map((item, i) => (i === index ? value : item)),
    }))
  }

  // ─── Requirements ───
  const addRequirement = () => {
    setForm((f) => ({ ...f, requirements: [...f.requirements, ""] }))
  }
  const removeRequirement = (index: number) => {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.filter((_, i) => i !== index),
    }))
  }
  const updateRequirement = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.map((item, i) => (i === index ? value : item)),
    }))
  }

  // ─── Who Is This For ───
  const addWhoFor = () => {
    setForm((f) => ({ ...f, whoIsThisFor: [...f.whoIsThisFor, ""] }))
  }
  const removeWhoFor = (index: number) => {
    setForm((f) => ({
      ...f,
      whoIsThisFor: f.whoIsThisFor.filter((_, i) => i !== index),
    }))
  }
  const updateWhoFor = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      whoIsThisFor: f.whoIsThisFor.map((item, i) => (i === index ? value : item)),
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

    const cleanedFeatures = form.keyFeatures.filter((f) => f.trim() !== "")
    const cleanedWhatLearn = form.whatYouWillLearn.filter((f) => f.trim() !== "")
    const cleanedRequirements = form.requirements.filter((f) => f.trim() !== "")
    const cleanedWhoFor = form.whoIsThisFor.filter((f) => f.trim() !== "")

    await mutate("/api/admin/courses", {
      method: "POST",
      body: JSON.stringify({
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        shortDescription: form.shortDescription.trim() || null,
        logo: form.logo || null,
        difficultyBadge: form.difficultyBadge || null,
        tags: form.tags.trim() || null,
        keyFeatures: cleanedFeatures,
        ctaType: form.ctaType,
        brochureUrl: form.brochureUrl || null,
        price: form.price ? parseInt(form.price, 10) : null,
        originalPrice: form.originalPrice
          ? parseInt(form.originalPrice, 10)
          : null,
        instructorId: form.instructorId || null,
        categoryId: form.categoryId || null,
        status: form.status,
        whatYouWillLearn: cleanedWhatLearn,
        requirements: cleanedRequirements,
        whoIsThisFor: cleanedWhoFor,
      }),
    })
  }

  const instructors = instructorsRes?.data || []

  // ─── Build preview data ───
  const previewCourse: PublicCourse = {
    id: "preview",
    title: form.title || "Course Title",
    slug: form.slug || "course-title",
    shortDescription: form.shortDescription || null,
    logo: form.logo || null,
    difficultyBadge: form.difficultyBadge || null,
    tags: form.tags || null,
    keyFeatures: form.keyFeatures.filter((f) => f.trim() !== ""),
    ctaType: form.ctaType,
    brochureUrl: form.brochureUrl || null,
    price: form.price ? parseInt(form.price, 10) : null,
    originalPrice: form.originalPrice
      ? parseInt(form.originalPrice, 10)
      : null,
    thumbnail: null,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>

        <div
          className={cn(
            "grid gap-6",
            showPreview ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-1 max-w-3xl"
          )}
        >
          {/* ─── FORM ─── */}
          <form onSubmit={handleSubmit} className="space-y-6" id="create-course-form">
            {/* Card Content Fields */}
            <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
              <h3 className="text-subheading">Card Content</h3>

              {/* Software Logo Upload */}
              <div className="space-y-2">
                <Label>Software Logo / Icon</Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {form.logo ? (
                  <div className="relative inline-block">
                    <img
                      src={form.logo}
                      alt="Logo preview"
                      className="h-20 object-contain rounded-lg border border-border bg-slate-50 p-2"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform"
                      onClick={() => setForm((f) => ({ ...f, logo: "" }))}
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
                      <span className="text-xs font-medium">
                        Upload logo (PNG, JPG — max 2MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Creo ProToolkit Development"
                  className="input-focus-ring"
                  required
                />
              </div>

              {/* Slug */}
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
                  placeholder="creo-protoolkit-development"
                />
              </div>

              {/* Difficulty Badge */}
              <div className="space-y-2">
                <Label>Difficulty Badge</Label>
                <Select
                  value={form.difficultyBadge}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, difficultyBadge: v }))
                  }
                >
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

              {/* Tech Stack / Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tech Stack / Language Tags</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder='e.g. C++, C# / VB.NET'
                  className="input-focus-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Displayed under the title on the course card
                </p>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shortDesc">Short Description</Label>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      form.shortDescription.length > 120
                        ? "text-destructive font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {form.shortDescription.length}/120
                  </span>
                </div>
                <Textarea
                  id="shortDesc"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shortDescription: e.target.value.slice(0, 120),
                    }))
                  }
                  placeholder="Brief course description shown on the card (2-3 lines)"
                  className="min-h-[80px] input-focus-ring resize-none"
                  maxLength={120}
                />
              </div>

              {/* Key Features (Repeatable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Key Features</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.keyFeatures.filter((f) => f.trim()).length}/6
                  </span>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFeature(idx)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {form.keyFeatures.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={addFeature}
                  >
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
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹ INR)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="e.g. 14999"
                    className="input-focus-ring"
                  />
                </div>

                {/* Original Price */}
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">
                    Original Price (₹ INR){" "}
                    <span className="text-muted-foreground font-normal">
                      — strikethrough
                    </span>
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        originalPrice: e.target.value,
                      }))
                    }
                    placeholder="e.g. 24999"
                    className="input-focus-ring"
                  />
                </div>
              </div>

              {/* CTA Type */}
              <div className="space-y-2">
                <Label>CTA Button Type</Label>
                <Select
                  value={form.ctaType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, ctaType: v }))
                  }
                >
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

              {/* Brochure PDF Upload */}
              <div className="space-y-2">
                <Label>Brochure PDF</Label>
                <input
                  ref={brochureInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleBrochureUpload}
                />
                {form.brochureUrl ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Brochure uploaded
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF ready for download
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setForm((f) => ({ ...f, brochureUrl: "" }))
                      }
                    >
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
                      <span className="text-xs font-medium">
                        Upload PDF (max 10MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Description & Settings */}
            <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 space-y-5">
              <h3 className="text-subheading">Additional Details</h3>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Detailed course description (visible on course detail page)..."
                  className="min-h-[120px] input-focus-ring resize-none"
                />
              </div>

              {/* What You'll Learn */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>What You'll Learn</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.whatYouWillLearn.filter((f) => f.trim()).length} bullet points
                  </span>
                </div>
                <div className="space-y-2">
                  {form.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-primary text-xs font-semibold shrink-0">✓</span>
                      <Input
                        value={item}
                        onChange={(e) => updateWhatLearn(idx, e.target.value)}
                        placeholder={`Learning Outcome ${idx + 1}`}
                        className="input-focus-ring"
                      />
                      {form.whatYouWillLearn.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeWhatLearn(idx)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={addWhatLearn}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Learning Outcome
                </Button>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prerequisites / Requirements</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.requirements.filter((f) => f.trim()).length} requirements
                  </span>
                </div>
                <div className="space-y-2">
                  {form.requirements.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-primary text-xs font-semibold shrink-0">·</span>
                      <Input
                        value={item}
                        onChange={(e) => updateRequirement(idx, e.target.value)}
                        placeholder={`Requirement ${idx + 1}`}
                        className="input-focus-ring"
                      />
                      {form.requirements.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeRequirement(idx)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={addRequirement}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Requirement
                </Button>
              </div>

              {/* Who Is This Course For */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Who Is This Course For</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.whoIsThisFor.filter((f) => f.trim()).length} items
                  </span>
                </div>
                <div className="space-y-2">
                  {form.whoIsThisFor.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-primary text-xs font-semibold shrink-0">→</span>
                      <Input
                        value={item}
                        onChange={(e) => updateWhoFor(idx, e.target.value)}
                        placeholder={`Target Audience ${idx + 1}`}
                        className="input-focus-ring"
                      />
                      {form.whoIsThisFor.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeWhoFor(idx)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={addWhoFor}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Target Audience
                </Button>
              </div>

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

              {/* Publish Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-4">
                <div>
                  <p className="text-sm font-medium">Publish immediately</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Published courses appear on the public courses page
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

            {/* Actions Bar */}
            <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    form.status === "published" ? "bg-success" : "bg-warning"
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

          {/* ─── LIVE PREVIEW ─── */}
          {showPreview && (
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
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
