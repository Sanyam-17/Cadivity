"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"
import {
  ShieldCheck,
  Loader2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Award,
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
  const reveal = useScrollReveal()

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
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-slate-500 text-sm">Preparing secure checkout gateway...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <h2 className="text-2xl font-bold text-rose-600">Checkout Error</h2>
        <p className="text-slate-600">{error || "Course details not found."}</p>
        <button
          onClick={() => router.push("/courses")}
          className="px-6 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Browse Courses
        </button>
      </div>
    )
  }

  const finalPrice = course.price || 0
  const originalPrice = course.originalPrice || finalPrice
  const discount = originalPrice - finalPrice
  const taxes = Math.round(finalPrice * 0.18 / 1.18)

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col-reverse lg:flex-row">
      {/* ── Left Column: Form ── */}
      <div className="flex-1 lg:max-w-[55%] xl:max-w-[60%] flex flex-col justify-center items-center py-16 px-6 sm:px-12 lg:px-20">
        <div className="w-full max-w-xl">
          <div className="mb-12">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <img src="/Cadivity.png" alt="Cadivity" className="h-10 object-contain" />
            </Link>
          </div>

          <h1 className="font-display text-5xl font-extrabold text-[#0f172a] mb-3 tracking-tight">Complete enrollment</h1>
          <p className="text-base text-slate-500 mb-10">Provide your details to secure your spot in the professional program.</p>

          <form id={formId} onSubmit={onSubmit} className="space-y-8">

            {/* Step 1 – Your Details */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a8a] text-white text-xs font-bold">
                  1
                </span>
                Your Details
              </h2>

              {session ? (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Logged in as</p>
                  <p className="text-sm font-bold text-slate-900">{session.user.name}</p>
                  <p className="text-xs text-slate-600">{session.user.email}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Full name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="guestName" className="text-xs text-slate-600 font-medium">
                      Full name
                    </Label>
                    <Input
                      id="guestName"
                      placeholder="Rohan Sharma"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1e3a8a] focus-visible:border-[#1e3a8a] h-11 rounded-lg"
                      {...guestForm.register("guestName")}
                    />
                    {guestForm.formState.errors.guestName && (
                      <p className="text-xs text-rose-500">{guestForm.formState.errors.guestName.message}</p>
                    )}
                  </div>

                  {/* Email address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="guestEmail" className="text-xs text-slate-600 font-medium">
                      Email address
                    </Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="rohan@example.com"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1e3a8a] focus-visible:border-[#1e3a8a] h-11 rounded-lg"
                      {...guestForm.register("guestEmail")}
                    />
                    {guestForm.formState.errors.guestEmail && (
                      <p className="text-xs text-rose-500">{guestForm.formState.errors.guestEmail.message}</p>
                    )}
                  </div>

                  {/* Phone number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="guestPhone" className="text-xs text-slate-600 font-medium">
                      Phone number
                    </Label>
                    <div className="flex gap-0">
                      <div className="flex items-center px-4 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium select-none h-11">
                        +91
                      </div>
                      <Input
                        id="guestPhone"
                        type="tel"
                        placeholder="98765 43210"
                        className="rounded-l-none bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#1e3a8a] focus-visible:border-[#1e3a8a] h-11"
                        {...guestForm.register("guestPhone")}
                      />
                    </div>
                    {guestForm.formState.errors.guestPhone && (
                      <p className="text-xs text-rose-500">{guestForm.formState.errors.guestPhone.message}</p>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    We&apos;ll create your account automatically after payment.{" "}
                    <Link
                      href={`/login?redirect=${encodeURIComponent(`/checkout/${slug}`)}`}
                      className="text-[#1e3a8a] font-semibold hover:underline"
                    >
                      Already have an account? Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {/* Step 2 – Payment Method */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a8a] text-white text-xs font-bold">
                  2
                </span>
                Payment Method
              </h2>

              <div className="flex items-center gap-4 bg-white border-2 border-[#1e3a8a] rounded-xl p-4 shadow-[0_0_0_1px_rgba(30,58,138,0.1)] relative">
                {/* PhonePe logo placeholder */}
                <div className="h-10 w-10 rounded-lg bg-[#1e3a8a] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none">
                    <circle cx="20" cy="20" r="20" fill="#1e3a8a" />
                    <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">P</text>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">PhonePe Secure Checkout</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    UPI, Credit/Debit Cards, Netbanking
                  </p>
                </div>
                <div className="bg-[#1e3a8a] rounded-full p-0.5">
                  <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              By proceeding, you agree to our <a href="#" className="font-medium text-slate-700 underline underline-offset-2">Terms of Service</a> and <a href="#" className="font-medium text-slate-700 underline underline-offset-2">Refund Policy</a>.
            </p>

            <button
              type="submit"
              disabled={isProcessing}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-sm font-bold transition-all duration-200",
                "bg-[#254291] text-white shadow-md hover:bg-[#1e3575] hover:shadow-lg",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "active:scale-[0.99]"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Secure Payment
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── Right Column: Order Summary ── */}
      <div className="lg:flex-1 bg-[#284a9e] text-white p-6 sm:p-12 lg:p-20 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          {/* Course Thumbnail */}
          <div className="rounded-xl overflow-hidden mb-8 shadow-xl relative aspect-video bg-slate-800">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#1e3a8a] flex items-center justify-center">
                 <span className="text-white/50 text-xl font-bold">{course.title.charAt(0)}</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wide">
               <CheckCircle2 className="h-3 w-3 text-emerald-400" />
               OFFICIAL CERTIFICATION
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold mb-3 leading-tight">{course.title}</h2>
          
          {course.shortDescription && (
            <p className="text-[#a4bcf0] text-sm leading-relaxed mb-10">
              {course.shortDescription}
            </p>
          )}

          {/* Pricing breakdown */}
          <div className="space-y-4 text-sm mb-6 pb-6 border-b border-white/10">
            <div className="flex justify-between items-center text-[#c6d7f8]">
              <span>Course Enrollment</span>
              <span>{formatPrice(originalPrice)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-emerald-400 font-medium">
                <span>Limited Time Discount</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-[#c6d7f8]">
              <span>GST (18%)</span>
              <span>{formatPrice(taxes)}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex justify-between items-center shadow-lg border border-white/10 mb-8">
            <span className="font-bold text-lg">Total Amount</span>
            <span className="font-bold text-4xl">{formatPrice(finalPrice)}</span>
          </div>

          <div className="space-y-3">
             <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3">
                <Lock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                   <p className="font-bold text-sm mb-1">Secure Transaction</p>
                   <p className="text-[11px] text-[#a4bcf0] leading-relaxed">256-bit SSL encrypted connection. Your data is never stored on our servers.</p>
                </div>
             </div>
             
             <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3">
                <Award className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                   <p className="font-bold text-sm mb-1">Lifetime Access</p>
                   <p className="text-[11px] text-[#a4bcf0] leading-relaxed">Includes all future course updates and a verifiable digital certificate upon completion.</p>
                </div>
             </div>
          </div>

          {/* Bottom encryption badges */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-[#8ca8e8] mt-10 uppercase tracking-widest font-semibold">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> PCI-DSS</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> SSL SECURE</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> 256-BIT</span>
          </div>
        </div>
      </div>
    </div>
  )
}