"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Info,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface CourseDetail {
  id: string
  title: string
  slug: string
  logo: string | null
  price: number | null
  originalPrice: number | null
}

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

  // Payment method: 'card' or 'upi'
  const [paymentMethod, setPaymentMethod] = React.useState<"card" | "upi">("card")

  // Form inputs pre-filled for one-click sandbox testing!
  const [guestName, setGuestName] = React.useState("Test Student")
  const [guestEmail, setGuestEmail] = React.useState("teststudent@cadivity.com")
  
  // Card inputs pre-filled for elite one-click sandbox testing!
  const [cardNumber, setCardNumber] = React.useState("4111 2222 3333 4444")
  const [cardExpiry, setCardExpiry] = React.useState("12/29")
  const [cardCvv, setCardCvv] = React.useState("123")
  const [cardName, setCardName] = React.useState("Test Student")

  // Sync logged in session user details if available
  React.useEffect(() => {
    if (session?.user) {
      setCardName(session.user.name)
      setGuestName(session.user.name)
      setGuestEmail(session.user.email)
    }
  }, [session])

  // Payment process simulation state
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [processStep, setProcessStep] = React.useState(0)

  React.useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true)
        const res = await fetch(`/api/courses/${slug}`)
        if (!res.ok) {
          throw new Error("Course not found")
        }
        const json = await res.json()
        setCourse(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course details")
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      fetchCourse()
    }
  }, [slug])

  // Handle card number formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    const formatted = value.match(/.{1,4}/g)?.join(" ") || ""
    setCardNumber(formatted.substring(0, 19))
  }

  // Handle card expiry formatting (MM/YY)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4)
    }
    setCardExpiry(value.substring(0, 5))
  }

  // Process simulation steps
  const steps = [
    "Contacting secure payment gateway...",
    paymentMethod === "card" 
      ? "Authorizing card transaction..." 
      : "Verifying UPI payment scan confirmation...",
    "Creating student record in Cadivity...",
    "Finalizing secure enrollment...",
  ]

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast.error("Please sign in to complete enrollment")
      router.push(`/login?redirect=${encodeURIComponent(`/checkout/${slug}`)}`)
      return
    }

    if (paymentMethod === "card") {
      if (!cardNumber || cardNumber.length < 19) {
        toast.error("Please enter a valid credit card number")
        return
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.error("Please enter expiry in MM/YY format")
        return
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error("Please enter CVV")
        return
      }
    }

    // Begin premium simulation
    setIsProcessing(true)
    setProcessStep(0)

    // Interval to tick through steps
    const stepInterval = setInterval(() => {
      setProcessStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 1200)

    try {
      // Perform the actual API enrollment on the backend!
      // This is dynamic and real!
      const res = await fetch(`/api/courses/${slug}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        const message = errorJson.error || "Enrollment failed"
        if (res.status === 401) {
          router.push(`/login?redirect=${encodeURIComponent(`/checkout/${slug}`)}`)
          throw new Error("Please sign in to enroll")
        }
        if (res.status === 403 && message.toLowerCase().includes("email")) {
          router.push(`/verify-email?redirect=${encodeURIComponent(`/checkout/${slug}`)}`)
        }
        throw new Error(message)
      }

      // Wait a tiny bit more to show the success state gracefully
      setTimeout(() => {
        clearInterval(stepInterval)
        toast.success("Payment Successful! Welcome aboard.")
        router.push("/dashboard/student")
      }, 5000)

    } catch (err: any) {
      clearInterval(stepInterval)
      setIsProcessing(false)
      toast.error(err.message || "Something went wrong during checkout. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-slate-400 text-sm">Preparing secure checkout gateway...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold font-display text-rose-500 mb-2">Checkout Error</h2>
        <p className="text-slate-400 mb-6">{error || "Course details not found."}</p>
        <Button onClick={() => router.push("/courses")} className="bg-primary text-white rounded-full">
          Browse Courses
        </Button>
      </div>
    )
  }

  const basePrice = course.price ? Math.round(course.price * 0.82) : 12711
  const taxes = course.price ? (course.price - basePrice) : 2288
  const finalPrice = course.price || 14999

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* ─── Header title ─── */}
      <div className="max-w-5xl mx-auto mb-8 text-center space-y-2">
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Complete Your Enrollment
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-light">
          Checkout Sandbox · Secure Dummy Payment Simulation
        </p>
      </div>

      <div ref={reveal.ref} className={cn("max-w-5xl mx-auto grid lg:grid-cols-[1fr_380px] gap-8 items-start transition-all duration-700", reveal.visible ? "animate-fade-in-up" : "opacity-0")}>
        
        {/* Left Column: Guest Details + Payment Methods */}
        <form onSubmit={handlePay} className="space-y-6">
          
          {/* User Account / Billing Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4 backdrop-blur shadow-sm">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">1</span>
              Account Information
            </h2>

            {session ? (
              // Authenticated User Details
              <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-4 space-y-1">
                <p className="text-xs text-slate-500 font-medium">Logged in as:</p>
                <p className="text-base font-bold text-white leading-tight">{session.user.name}</p>
                <p className="text-xs text-slate-400 font-light">{session.user.email}</p>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex gap-2 text-xs text-slate-200">
                  <Info className="h-5 w-5 text-amber-400 shrink-0" />
                  <p className="font-light">
                    Sign in with your Cadivity account to enroll. Guest checkout is disabled for security.
                  </p>
                </div>
                <Button asChild className="w-full bg-primary text-white">
                  <Link href={`/login?redirect=${encodeURIComponent(`/checkout/${slug}`)}`}>
                    Sign in to continue
                  </Link>
                </Button>
                <p className="text-center text-xs text-slate-500">
                  New here?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Select */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-6 backdrop-blur shadow-sm">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">2</span>
              Payment Method Simulation
            </h2>

            {/* Selector Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all hover:bg-slate-900/50",
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5 text-white ring-1 ring-primary/45"
                    : "border-slate-800 text-slate-400 hover:text-slate-200"
                )}
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Credit/Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all hover:bg-slate-900/50",
                  paymentMethod === "upi"
                    ? "border-primary bg-primary/5 text-white ring-1 ring-primary/45"
                    : "border-slate-800 text-slate-400 hover:text-slate-200"
                )}
              >
                <QrCode className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">UPI Payment Scan</span>
              </button>
            </div>

            {/* Payment forms */}
            {paymentMethod === "card" ? (
              // Dynamic Card layout
              <div className="space-y-4">
                {/* Visual card mockup */}
                <div className="relative mx-auto h-44 w-72 rounded-2xl bg-gradient-to-br from-slate-900 via-primary/80 to-slate-950 p-6 text-white shadow-xl border border-white/10 overflow-hidden select-none">
                  {/* Chip */}
                  <div className="h-9 w-12 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 text-sm">
                    CAD
                  </div>
                  {/* Number */}
                  <p className="mt-6 font-mono text-lg tracking-widest text-white/90">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </p>
                  {/* Footer details */}
                  <div className="flex justify-between items-center mt-6">
                    <div>
                      <p className="text-[8px] text-white/50 uppercase">Card Holder</p>
                      <p className="font-sans text-xs font-semibold tracking-wide truncate max-w-[140px]">
                        {cardName.toUpperCase() || "YOUR NAME HERE"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-white/50 uppercase text-right">Expires</p>
                      <p className="font-mono text-xs text-right font-semibold">
                        {cardExpiry || "MM/YY"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      required={paymentMethod === "card"}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on credit card"
                      className="bg-slate-955 border-slate-800 input-focus-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      required={paymentMethod === "card"}
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4111 2222 3333 4444"
                      className="bg-slate-955 border-slate-800 font-mono input-focus-ring"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Expiration Date</Label>
                      <Input
                        id="cardExpiry"
                        required={paymentMethod === "card"}
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        placeholder="MM/YY"
                        className="bg-slate-955 border-slate-800 font-mono input-focus-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV / CVN</Label>
                      <Input
                        id="cardCvv"
                        type="password"
                        required={paymentMethod === "card"}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                        placeholder="123"
                        className="bg-slate-955 border-slate-800 font-mono input-focus-ring"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // UPI QR Scan simulation
              <div className="flex flex-col items-center p-4 bg-slate-950/40 rounded-xl border border-slate-850/60 space-y-4">
                <div className="relative p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-200">
                  {/* Sleek simulated QR Code */}
                  <div className="h-36 w-36 bg-slate-100 flex flex-col justify-center items-center border border-slate-200 rounded-lg p-2 gap-1.5 font-bold font-mono text-slate-800 text-[10px]">
                    <QrCode className="h-20 w-20 text-slate-900" strokeWidth={1.5} />
                    <span className="text-primary text-[8px]">CADIVITY PAY</span>
                  </div>
                </div>
                
                <div className="text-center space-y-1 max-w-sm">
                  <p className="text-sm font-semibold text-white">Scan the QR code to make a sandbox payment</p>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Open your camera or UPI App (GPay, PhonePe, Paytm) and scan. Or use our sandbox UPI VPA: <strong className="text-slate-200">cadivity@upi</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Secure Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/95 text-white py-6 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-5 w-5" />
            Complete Sandbox Payment
          </Button>
        </form>

        {/* Right Column: Pricing breakdown summary */}
        <div className="sticky top-28 space-y-6">
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur shadow-xl overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
            <CardContent className="p-6 space-y-6">
              <h2 className="text-md font-bold text-white uppercase tracking-wider">Order Summary</h2>

              {/* Course Detail Card */}
              <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl">
                <div className="h-10 w-10 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-lg text-xs font-bold text-white shrink-0">
                  {course.logo ? (
                    <img src={course.logo} alt="Logo" className="h-6 object-contain" />
                  ) : (
                    "CAD"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium truncate">Course item:</p>
                  <p className="text-sm font-bold text-white leading-tight truncate">{course.title}</p>
                </div>
              </div>

              {/* Pricing Breakout details */}
              <div className="space-y-3.5 pt-2 border-t border-slate-800/80 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Subtotal Base tuition</span>
                  <span className="text-slate-200">{formatPrice(basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">GST / Tax rate (18%)</span>
                  <span className="text-slate-200">{formatPrice(taxes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Platform sandbox fee</span>
                  <span className="text-emerald-500 font-semibold">FREE</span>
                </div>
                
                <div className="flex justify-between pt-4 border-t border-slate-800 font-bold text-base text-white font-display">
                  <span>Total Tuition:</span>
                  <span>{formatPrice(finalPrice)}</span>
                </div>
              </div>

              {/* Safe sandbox badge */}
              <div className="flex items-start gap-2.5 bg-slate-950/40 border border-slate-850/60 p-3.5 rounded-xl text-[11px] text-slate-400 font-light">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p>
                  You are inside the secure sandbox environment. No actual banking transaction will be initiated. All billing data is processed in a test loop.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ─── PREMIUM PAYMENT PROCESSING STEP MODAL ─── */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-fade-in-up">
            
            {/* Visual spinner element */}
            <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Smartphone className="h-8 w-8 text-primary animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-display">Simulating Secure Transaction</h3>
              <p className="text-slate-400 text-xs font-light">Please do not refresh the page or click back.</p>
            </div>

            {/* Dynamic Step indicator */}
            <div className="bg-slate-950/50 border border-slate-850/60 rounded-2xl p-4 text-left space-y-2.5">
              {steps.map((step, idx) => {
                const isActive = processStep === idx
                const isCompleted = processStep > idx
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs md:text-sm font-light">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="h-4.5 w-4.5 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-800 shrink-0" />
                    )}
                    <span className={cn(
                      isCompleted ? "text-slate-400 line-through" : isActive ? "text-white font-medium" : "text-slate-600"
                    )}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
