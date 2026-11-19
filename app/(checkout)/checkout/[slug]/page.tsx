"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  ShieldCheck,
  Loader2,
  Lock,
  ArrowUpRight,
  CheckCircle2,
  Award,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface CourseDetail {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  logo: string | null
  shortDescription: string | null
  price: number | null
  originalPrice: number | null
}

const guestSchema = z.object({
  guestName: z.string().trim().min(2, "Enter your full name").max(100),
  guestEmail: z.string().trim().email("Enter a valid email address"),
  guestPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
})
type GuestFormValues = z.infer<typeof guestSchema>

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { data: session } = authClient.useSession()

  const [course, setCourse] = React.useState<CourseDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const guestForm = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: { guestName: "", guestEmail: "", guestPhone: "" },
  })

  React.useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true)
        const res = await fetch(`/api/courses/${slug}`)
        if (!res.ok) throw new Error("Course not found")
        const json = await res.json()
        setCourse(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course details")
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchCourse()
  }, [slug])

  const handlePay = async (guestData?: GuestFormValues) => {
    setIsProcessing(true)
    try {
      const body: Record<string, string> = { courseSlug: slug }
      if (!session && guestData) {
        body.guestName = guestData.guestName
        body.guestEmail = guestData.guestEmail
        body.guestPhone = guestData.guestPhone
      }

      const res = await fetch(`/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        const message = errorJson.error || "Payment initiation failed"

        if (res.status === 409) {
          toast.error(message, {
            action: {
              label: "Sign in",
              onClick: () =>
                router.push(`/login?redirect=${encodeURIComponent(`/checkout/${slug}`)}`),
            },
          })
          throw new Error(message)
        }

        if (res.status === 403 && message.toLowerCase().includes("email")) {
          router.push(`/verify-email?redirect=${encodeURIComponent(`/checkout/${slug}`)}`)
        }

        throw new Error(message)
      }

      const json = await res.json()
      if (json.data?.redirectUrl) {
        window.location.href = json.data.redirectUrl
      } else {
        throw new Error("Invalid response from payment gateway")
      }
    } catch (err: any) {
      setIsProcessing(false)
      toast.error(err.message || "Something went wrong during checkout. Please try again.")
    }
  }

  const formId = "checkout-form"

  const onSubmit = session
    ? (e: React.FormEvent) => {
        e.preventDefault()
        handlePay()
      }
    : guestForm.handleSubmit((values) => handlePay(values))

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cad-cream)] flex flex-col justify-center items-center gap-4 p-4">
        <Loader2 className="h-8 w-8 text-[var(--cad-cobalt)] animate-spin" />
        <p className="cad-text-mono text-xs uppercase tracking-wider text-[var(--cad-muted)]">
          Preparing secure checkout gateway...
        </p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[var(--cad-cream)] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[var(--cad-cream)] border border-[var(--cad-hairline)] rounded-sm p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--cad-error)]/40 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6 text-[var(--cad-error)]" />
          </div>
          <div className="space-y-2">
            <p className="cad-eyebrow text-[var(--cad-error)]">CHECKOUT ERROR</p>
            <h1 className="cad-text-h3 text-[var(--cad-ink)]">Course not found</h1>
            <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              {error || "We couldn't retrieve details for this course."}
            </p>
          </div>
          <Link href="/courses" className="cad-btn cad-btn-outline border-[var(--cad-hairline)] text-[var(--cad-ink)] w-full">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  const finalPrice = course.price || 0
  const originalPrice = course.originalPrice || finalPrice
  const discount = originalPrice - finalPrice
  const taxes = Math.round((finalPrice * 0.18) / 1.18)

  return (
    <div className="min-h-screen bg-[var(--cad-cream)] text-[var(--cad-ink)] flex flex-col-reverse lg:flex-row">
      {/* ── Left Column: Form ── */}
      <div className="flex-1 lg:max-w-[55%] xl:max-w-[60%] flex flex-col justify-center items-center py-12 px-6 sm:px-12 lg:px-16 border-r border-[var(--cad-hairline)]">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <img src="/Cadivity.png" alt="Cadivity" className="h-9 object-contain" />
            </Link>
          </div>

          <div className="mb-8">
            <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-2">CHECKOUT & ENROLLMENT</p>
            <h1 className="cad-text-h2 text-[var(--cad-ink)]">Complete enrollment</h1>
            <p className="text-sm text-[var(--cad-muted)] mt-1.5" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              Provide your details to secure your spot in the professional engineering program.
            </p>
          </div>

          <form id={formId} onSubmit={onSubmit} className="space-y-8">
            {/* Step 1 – Your Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--cad-hairline)] pb-2.5">
                <span className="cad-eyebrow text-[var(--cad-ink)]">
                  01. YOUR DETAILS
                </span>
                {session && (
                  <span className="cad-text-mono text-[10px] uppercase text-[var(--cad-cobalt)] tracking-wider">
                    Verified Account
                  </span>
                )}
              </div>

              {session ? (
                <div className="bg-[var(--cad-sand)]/40 border border-[var(--cad-hairline)] rounded-sm p-4 space-y-1">
                  <p className="cad-text-mono text-[11px] text-[var(--cad-muted)] uppercase tracking-wider">
                    LOGGED IN AS
                  </p>
                  <p className="text-sm font-semibold text-[var(--cad-ink)]">{session.user.name}</p>
                  <p className="cad-text-mono text-xs text-[var(--cad-muted)]">{session.user.email}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Full name */}
                  <div className="space-y-1.5">
                    <label htmlFor="guestName" className="cad-input-label">
                      Full name
                    </label>
                    <Input
                      id="guestName"
                      placeholder="Rohan Sharma"
                      className="bg-transparent border-[var(--cad-hairline)] text-[var(--cad-ink)] focus:border-[var(--cad-sky)] focus:ring-2 focus:ring-[var(--cad-sky)]/20 h-12 rounded-sm text-sm"
                      {...guestForm.register("guestName")}
                    />
                    {guestForm.formState.errors.guestName && (
                      <p className="cad-text-mono text-xs text-[var(--cad-error)] mt-1">
                        {guestForm.formState.errors.guestName.message}
                      </p>
                    )}
                  </div>

                  {/* Email address */}
                  <div className="space-y-1.5">
                    <label htmlFor="guestEmail" className="cad-input-label">
                      Email address
                    </label>
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="rohan@example.com"
                      className="bg-transparent border-[var(--cad-hairline)] text-[var(--cad-ink)] focus:border-[var(--cad-sky)] focus:ring-2 focus:ring-[var(--cad-sky)]/20 h-12 rounded-sm text-sm"
                      {...guestForm.register("guestEmail")}
                    />
                    {guestForm.formState.errors.guestEmail && (
                      <p className="cad-text-mono text-xs text-[var(--cad-error)] mt-1">
                        {guestForm.formState.errors.guestEmail.message}
                      </p>
                    )}
                  </div>

                  {/* Phone number */}
                  <div className="space-y-1.5">
                    <label htmlFor="guestPhone" className="cad-input-label">
                      Phone number
                    </label>
                    <div className="flex gap-0">
                      <div className="flex items-center px-4 border border-r-0 border-[var(--cad-hairline)] bg-[var(--cad-sand)]/40 text-[var(--cad-muted)] cad-text-mono text-xs select-none h-12 rounded-l-sm">
                        +91
                      </div>
                      <Input
                        id="guestPhone"
                        type="tel"
                        placeholder="98765 43210"
                        className="rounded-l-none bg-transparent border-[var(--cad-hairline)] text-[var(--cad-ink)] focus:border-[var(--cad-sky)] focus:ring-2 focus:ring-[var(--cad-sky)]/20 h-12 rounded-r-sm text-sm"
                        {...guestForm.register("guestPhone")}
                      />
                    </div>
                    {guestForm.formState.errors.guestPhone && (
                      <p className="cad-text-mono text-xs text-[var(--cad-error)] mt-1">
                        {guestForm.formState.errors.guestPhone.message}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[var(--cad-muted)] pt-1" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                    We&apos;ll create your account automatically after payment.{" "}
                    <Link
                      href={`/login?redirect=${encodeURIComponent(`/checkout/${slug}`)}`}
                      className="cad-text-mono text-xs text-[var(--cad-cobalt)] hover:text-[var(--cad-sky)] underline ml-1"
                    >
                      Already have an account? Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {/* Step 2 – Payment Method */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--cad-hairline)] pb-2.5">
                <span className="cad-eyebrow text-[var(--cad-ink)]">
                  02. PAYMENT METHOD
                </span>
                <span className="cad-text-mono text-[10px] uppercase text-[var(--cad-muted)] tracking-wider">
                  256-Bit Encrypted
                </span>
              </div>

              <div className="flex items-center gap-4 bg-[var(--cad-ice)]/30 border border-[var(--cad-cobalt)] rounded-sm p-4 relative">
                <div className="h-10 w-10 bg-[var(--cad-cobalt)] text-white flex items-center justify-center shrink-0 rounded-sm font-bold font-mono">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--cad-ink)]">PhonePe Secure Gateway</p>
                  <p className="cad-text-mono text-[11px] text-[var(--cad-muted)] mt-0.5">
                    UPI, Credit/Debit Cards, Netbanking
                  </p>
                </div>
                <div className="text-[var(--cad-cobalt)]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              By proceeding, you agree to our{" "}
              <a href="#" className="underline text-[var(--cad-ink)]">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="underline text-[var(--cad-ink)]">Refund Policy</a>.
            </p>

            <button
              type="submit"
              disabled={isProcessing}
              className="cad-btn cad-btn-amber w-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Gateway...</span>
                </>
              ) : (
                <>
                  <span>Complete Secure Payment</span>
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── Right Column: Order Summary ── */}
      <div className="lg:flex-1 bg-[var(--cad-navy-950)] text-white p-6 sm:p-12 lg:p-16 flex flex-col justify-center relative">
        {/* Subtle grid decor */}
        <div className="cad-grid-bg absolute inset-0 opacity-15 pointer-events-none" />

        <div className="max-w-md w-full mx-auto relative z-10">
          {/* Course Thumbnail */}
          <div className="rounded-sm overflow-hidden mb-6 border border-white/10 relative aspect-video bg-black/40">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--cad-cobalt)]/40 flex items-center justify-center">
                <span className="text-white/60 text-2xl font-mono font-bold">{course.title.charAt(0)}</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-[var(--cad-navy-950)]/90 backdrop-blur-sm border border-white/20 text-white cad-text-mono text-[10px] px-2.5 py-1 rounded-sm flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3 text-[var(--cad-sky)]" />
              OFFICIAL CERTIFICATION
            </div>
          </div>

          <div className="mb-6">
            <p className="cad-eyebrow text-[var(--cad-sky)] mb-2">COURSE OVERVIEW</p>
            <h2 className="cad-text-h3 text-white leading-tight">{course.title}</h2>
            {course.shortDescription && (
              <p className="text-slate-300 text-sm leading-relaxed mt-2" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                {course.shortDescription}
              </p>
            )}
          </div>

          {/* Pricing breakdown */}
          <div className="space-y-3 text-sm mb-6 pb-6 border-b border-white/10" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            <div className="flex justify-between items-center text-slate-300">
              <span>Course Enrollment</span>
              <span className="cad-text-mono">{formatPrice(originalPrice)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-[var(--cad-sky)]">
                <span>Limited Time Discount</span>
                <span className="cad-text-mono">−{formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>GST Included (18%)</span>
              <span className="cad-text-mono">{formatPrice(taxes)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="bg-white/5 border border-white/10 rounded-sm p-5 flex justify-between items-center mb-8">
            <span className="cad-eyebrow text-slate-300">TOTAL PAYABLE</span>
            <span className="cad-text-mono text-3xl font-bold text-white">{formatPrice(finalPrice)}</span>
          </div>

          <div className="space-y-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-sm p-3.5 flex gap-3">
              <Lock className="h-4 w-4 text-[var(--cad-sky)] shrink-0 mt-0.5" />
              <div>
                <p className="cad-text-mono text-xs uppercase tracking-wider text-white">SECURE TRANSACTION</p>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">256-bit SSL encrypted. Payment details processed directly via regulated banking gateway.</p>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-sm p-3.5 flex gap-3">
              <Award className="h-4 w-4 text-[var(--cad-sky)] shrink-0 mt-0.5" />
              <div>
                <p className="cad-text-mono text-xs uppercase tracking-wider text-white">LIFETIME ACCESS</p>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">Includes full curriculum, code projects, future module updates, and verifiable certificate.</p>
              </div>
            </div>
          </div>

          {/* Bottom encryption badges */}
          <div className="flex items-center justify-center gap-6 cad-text-mono text-[10px] text-slate-500 mt-8 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-[var(--cad-sky)]" /> PCI-DSS</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3 w-3 text-[var(--cad-sky)]" /> SSL SECURE</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-[var(--cad-sky)]" /> 256-BIT</span>
          </div>
        </div>
      </div>
    </div>
  )
}