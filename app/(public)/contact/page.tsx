"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail, Phone, MapPin, Clock, Loader2, CheckCircle2,
  XCircle, ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

/* ──────────────── Schema ──────────────── */

const phoneRegex = /^\+?[0-9][\d\s\-().]{6,18}$/;

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number (e.g. +1 555 1234567)"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

/* ──────────────── Page ──────────────── */

export default function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heroReveal = useScrollReveal();
  const cardsReveal = useScrollReveal();
  const formReveal = useScrollReveal();
  const faqReveal = useScrollReveal();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      setDialogType("success");
      setDialogOpen(true);
      form.reset();
    } catch {
      setDialogType("error");
      setDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const messageValue = form.watch("message");

  const faqs = [
    { q: "Do I need programming experience before enrolling?", a: "No — basic logic understanding helps, but most programs include foundational coding support." },
    { q: "Are sessions live or recorded?", a: "Sessions are live. Recordings are shared after each class for revision and reference." },
    { q: "Will I receive project files or sample code?", a: "Yes — every module includes reference scripts, exercises, and real automation project frameworks." },
    { q: "Do you help with resumes and job preparation?", a: "Yes — resume assistance, project placement, and guidance on interviews are included." },
    { q: "Can companies request customized workflows or projects?", a: "Yes — corporate programs can include organization-specific automation development and code review." },
    { q: "Do I get lifetime access to recordings?", a: "Recordings access remains available for 3-6 months depending on course level." },
    { q: "Is certification provided?", a: "Yes — digital certification is provided after successful completion of the modules and project." },
  ];

  const contactItems = [
    { icon: Mail, label: "Email Us", value: "enquiry@cadivity.com", href: "mailto:enquiry@cadivity.com" },
    { icon: Phone, label: "Call Us", value: "+91-6372495858", href: "tel:+916372495858" },
    { icon: MapPin, label: "Location", value: "India · Worldwide", href: undefined },
    { icon: Clock, label: "Business Hours", value: "Mon – Sat, 10 AM – 7 PM", href: undefined },
  ];

  const inputClasses = "bg-transparent border-[var(--cad-hairline)] text-[var(--cad-ink)] placeholder:text-[var(--cad-muted)]/50 focus:border-[var(--cad-sky)] focus:ring-2 focus:ring-[var(--cad-sky)]/20 transition-all duration-200 rounded-sm h-12";

  return (
    <div className="min-h-screen flex flex-col">

      {/* ────────── Hero ────────── */}
      <section className="relative cad-bg-navy cad-section pt-32 pb-16 md:pb-20 overflow-hidden">
        <div ref={heroReveal.ref} className={`cad-container relative z-10 transition-all duration-700 ${heroReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="max-w-3xl">
            <p className="cad-eyebrow text-[var(--cad-sky)] mb-3">GET IN TOUCH</p>
            <h1 className="cad-text-display text-white mb-6">
              Let&apos;s Build{" "}
              <span className="cad-accent-sky">Together.</span>
            </h1>
            <p className="cad-text-body max-w-2xl text-white/70">
              Have questions about CAD automation or training? Ready to start a project?
              We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* ────────── Contact Info Strip ────────── */}
      <section className="cad-bg-cream border-b border-[var(--cad-hairline)]">
        <div ref={cardsReveal.ref} className="cad-container">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {contactItems.map((item, i) => (
              <div
                key={i}
                className={`py-8 px-4 lg:px-6 flex items-start gap-4 ${i > 0 ? 'border-l border-[var(--cad-hairline)]' : ''} ${i >= 2 ? 'max-lg:border-l-0 max-lg:border-t max-lg:border-[var(--cad-hairline)]' : ''} ${cardsReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 80 + 100}ms` }}
              >
                <item.icon className="h-5 w-5 text-[var(--cad-cobalt)] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="cad-text-mono text-[var(--cad-ink)] mb-1">{item.label}</h3>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-[var(--cad-muted)] hover:text-[var(--cad-cobalt)] transition-colors" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── Form + FAQ ────────── */}
      <section className="cad-bg-cream cad-section overflow-hidden">
        <div className="cad-container">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* ── Left: Contact Form (3/5) ── */}
            <div ref={formReveal.ref} className={`lg:col-span-3 transition-all duration-700 ${formReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
              <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">SEND A MESSAGE</p>
              <h2 className="cad-text-h2 text-[var(--cad-ink)] mb-2">
                Write to <span className="cad-accent-teal font-bold">us.</span>
              </h2>
              <p className="cad-text-body mb-8">
                Fill the form below and we&apos;ll get back within 24 hours.
              </p>

              {/* Form */}
              <div className="cad-card bg-white p-6 sm:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {/* Row 1 */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="cad-input-label">Full Name <span className="text-[var(--cad-error)]">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className={inputClasses} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="cad-input-label">Email Address <span className="text-[var(--cad-error)]">*</span></FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" className={inputClasses} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Row 2 */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="cad-input-label">Phone Number <span className="text-[var(--cad-error)]">*</span></FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 555 1234567" className={inputClasses} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="cad-input-label">Subject <span className="text-[var(--cad-error)]">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Training Inquiry / Project Request" className={inputClasses} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Row 3: Message */}
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="cad-input-label">Message <span className="text-[var(--cad-error)]">*</span></FormLabel>
                          <span className={`cad-text-mono tabular-nums transition-colors ${(messageValue?.length || 0) >= 10 ? "text-[var(--cad-success)]" : "text-[var(--cad-muted)]"}`} style={{ fontSize: '10px' }}>
                            {messageValue?.length || 0} characters
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your requirements, questions, or how we can help..."
                            className={`min-h-36 resize-y ${inputClasses}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cad-btn cad-btn-primary w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
                        </>
                      )}
                    </button>
                  </form>
                </Form>
              </div>
            </div>

            {/* ── Right: FAQ (2/5) ── */}
            <div ref={faqReveal.ref} className={`lg:col-span-2 transition-all duration-700 ${faqReveal.visible ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
              <p className="cad-eyebrow text-[var(--cad-cobalt)] mb-4">COMMON QUESTIONS</p>
              <h2 className="cad-text-h2 text-[var(--cad-ink)] mb-8">
                FAQs.
              </h2>

              <Accordion type="single" collapsible className="w-full space-y-0">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border border-[var(--cad-hairline)] border-b-0 last:border-b px-5 bg-white data-[state=open]:bg-[var(--cad-sand)]"
                  >
                    <AccordionTrigger className="text-left font-medium text-[var(--cad-ink)] hover:text-[var(--cad-cobalt)] transition-colors text-sm py-4 data-[state=open]:text-[var(--cad-cobalt)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[var(--cad-muted)] text-sm pb-4 leading-relaxed" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Still have questions? */}
              <div className="mt-8 cad-card cad-card-cobalt p-6 space-y-3">
                <h3 className="cad-text-h3 text-white">Still have questions?</h3>
                <p className="text-sm text-white/60 leading-relaxed" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                  Our team is happy to help. Reach out anytime.
                </p>
                <a
                  href="mailto:enquiry@cadivity.com"
                  className="cad-btn cad-btn-outline text-white border-white/30 hover:border-white/60"
                >
                  <Mail className="h-4 w-4" />
                  Email Us Directly
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Success / Error Dialog ────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md text-center p-8 border border-[var(--cad-hairline)] rounded-sm shadow-lg">
          <DialogHeader className="items-center gap-2">
            {dialogType === "success" ? (
              <div className="w-14 h-14 mx-auto rounded-full border-2 border-[var(--cad-success)] flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-[var(--cad-success)]" />
              </div>
            ) : (
              <div className="w-14 h-14 mx-auto rounded-full border-2 border-[var(--cad-error)] flex items-center justify-center">
                <XCircle className="h-7 w-7 text-[var(--cad-error)]" />
              </div>
            )}

            <DialogTitle className="cad-text-h3 mt-4">
              {dialogType === "success" ? "Message Sent!" : "Something Went Wrong"}
            </DialogTitle>

            <DialogDescription className="mt-2 text-[var(--cad-muted)] text-sm leading-relaxed" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              {dialogType === "success"
                ? "Thanks for contacting Cadivity! We've sent you a confirmation email. Our team will respond within 24 hours."
                : "We couldn't send your message right now. Please try again later or email us directly."}
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={() => setDialogOpen(false)}
            className={`mt-5 w-full cad-btn ${dialogType === "success" ? "cad-btn-primary" : "cad-btn-cobalt"}`}
          >
            {dialogType === "success" ? "Got it, thanks!" : "Try Again"}
          </button>
        </DialogContent>
      </Dialog>

    </div>
  );
}
