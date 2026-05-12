"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail, Phone, Send, MapPin, Clock, Loader2, CheckCircle2,
  XCircle, MessageSquare, Sparkles, ArrowRight,
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

  const contactCards = [
    { icon: Mail, label: "Email Us", value: "enquiry@cadivity.com", href: "mailto:enquiry@cadivity.com", gradient: "from-blue-500/20 to-cyan-500/20", iconBg: "bg-blue-500/10", iconColor: "text-blue-600", borderAccent: "group-hover:border-blue-400" },
    { icon: Phone, label: "Call Us", value: "+91-6372495858", href: "tel:+916372495858", gradient: "from-violet-500/20 to-purple-500/20", iconBg: "bg-violet-500/10", iconColor: "text-violet-600", borderAccent: "group-hover:border-violet-400" },
    { icon: MapPin, label: "Location", value: "India · Worldwide", href: undefined, gradient: "from-emerald-500/20 to-teal-500/20", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600", borderAccent: "group-hover:border-emerald-400" },
    { icon: Clock, label: "Business Hours", value: "Mon – Sat, 10 AM – 7 PM", href: undefined, gradient: "from-amber-500/20 to-orange-500/20", iconBg: "bg-amber-500/10", iconColor: "text-amber-600", borderAccent: "group-hover:border-amber-400" },
  ];

  const inputClasses = "bg-white/80 backdrop-blur-sm border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-slate-300 transition-all duration-300 rounded-xl h-12";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ────────── Hero ────────── */}
      <section className="relative py-24 md:py-32 bg-slate-900 text-white overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900 to-cyan-900/30 animate-gradient-shift" />

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-16 left-[10%] w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 animate-float" />
          <div className="absolute top-32 right-[15%] w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 animate-float delay-300" style={{ animationDuration: "10s" }} />
          <div className="absolute bottom-20 left-[20%] w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/15 animate-float delay-700" style={{ animationDuration: "12s" }} />
          <div className="absolute bottom-12 right-[25%] w-16 h-16 rounded-2xl bg-emerald-500/8 border border-emerald-500/15 animate-float delay-500" style={{ animationDuration: "9s" }} />
          <div className="absolute top-1/2 left-[5%] w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 animate-float delay-200" style={{ animationDuration: "11s" }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div ref={heroReveal.ref} className={`container relative z-10 mx-auto px-4 text-center transition-all duration-700 ${heroReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300 tracking-wide">Get in Touch</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Let&apos;s Build Something
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Extraordinary Together
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have questions about CAD automation or training? Ready to start a project?
            We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ────────── Contact Info Cards ────────── */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div ref={cardsReveal.ref} className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactCards.map((item, i) => (
              <Card
                key={i}
                className={`group relative overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 rounded-2xl ${cardsReveal.visible ? "animate-fade-in-up" : "opacity-0"} ${item.borderAccent}`}
                style={{ animationDelay: `${i * 100 + 100}ms` }}
              >
                {/* Gradient hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="relative pt-6 pb-6 flex items-start gap-4">
                  <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${item.iconBg} shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5">{item.label}</h3>
                    {item.href ? (
                      <a href={item.href} className="text-slate-600 text-sm hover:text-primary transition-colors duration-200">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-slate-600 text-sm">{item.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── Form + FAQ ────────── */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* ── Left: Contact Form (3/5) ── */}
            <div ref={formReveal.ref} className={`lg:col-span-3 transition-all duration-700 ${formReveal.visible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                  Send us a Message
                </h2>
              </div>
              <p className="text-slate-500 mb-8 ml-[52px]">
                Fill the form below and we&apos;ll get back within 24 hours.
              </p>

              {/* Form Card */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {/* Row 1 */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium text-sm">Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className={inputClasses} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium text-sm">Email Address <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel className="text-slate-700 font-medium text-sm">Phone Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 555 1234567" className={inputClasses} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium text-sm">Subject <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel className="text-slate-700 font-medium text-sm">Message <span className="text-red-500">*</span></FormLabel>
                          <span className={`text-xs tabular-nums transition-colors ${(messageValue?.length || 0) >= 10 ? "text-emerald-500" : "text-slate-400"}`}>
                            {messageValue?.length || 0} characters
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your requirements, questions, or how we can help..."
                            className={`min-h-36 resize-y rounded-xl ${inputClasses}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-10 py-3 h-12 bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-700/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-base font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/20 rounded-xl group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          <span>Send Message</span>
                          <ArrowRight className="h-4 w-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            {/* ── Right: FAQ (2/5) ── */}
            <div ref={faqReveal.ref} className={`lg:col-span-2 transition-all duration-700 ${faqReveal.visible ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                  FAQs
                </h2>
              </div>
              <p className="text-slate-500 mb-8 ml-[52px]">Quick answers to common questions.</p>

              <Accordion type="single" collapsible className="w-full space-y-2.5">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border border-slate-200/60 rounded-xl px-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 data-[state=open]:bg-gradient-to-br data-[state=open]:from-primary/[0.03] data-[state=open]:to-cyan-500/[0.03] data-[state=open]:border-primary/20"
                  >
                    <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-primary transition-colors text-sm py-4 [&[data-state=open]]:text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Extra CTA Card */}
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-500/10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-blue-500/10 translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-lg mb-2">Still have questions?</h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    Our team is happy to help. Reach out anytime.
                  </p>
                  <a
                    href="mailto:enquiry@cadivity.com"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300"
                  >
                    <Mail className="h-4 w-4" />
                    Email Us Directly
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Success / Error Dialog ────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md text-center p-8 rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="items-center gap-2">
            {dialogType === "success" ? (
              <div className="relative">
                {/* Confetti burst rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-emerald-200 animate-confetti-burst" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-300 animate-confetti-burst delay-100" />
                </div>
                {/* Checkmark */}
                <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center animate-scale-in shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center animate-scale-in shadow-lg shadow-red-200">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            )}

            <DialogTitle className="text-2xl font-display mt-4">
              {dialogType === "success" ? "Message Sent!" : "Something Went Wrong"}
            </DialogTitle>

            <DialogDescription className="mt-2 text-slate-500 text-base leading-relaxed">
              {dialogType === "success"
                ? "Thanks for contacting Cadivity! We've sent you a confirmation email. Our team will respond within 24 hours."
                : "We couldn't send your message right now. Please try again later or email us directly."}
            </DialogDescription>
          </DialogHeader>

          <Button
            onClick={() => setDialogOpen(false)}
            className={`mt-5 w-full h-12 rounded-xl font-semibold text-base transition-all duration-300 shadow-md ${
              dialogType === "success"
                ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200"
                : "bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-700/90"
            }`}
          >
            {dialogType === "success" ? "Got it, thanks!" : "Try Again"}
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
