"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Mail,
  Phone,
  Send,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const faqs = [
    {
      q: "Do I need programming experience before enrolling?",
      a: "No — basic logic understanding helps, but most programs include foundational coding support.",
    },
    {
      q: "Are sessions live or recorded?",
      a: "Sessions are live. Recordings are shared after each class for revision and reference.",
    },
    {
      q: "Will I receive project files or sample code?",
      a: "Yes — every module includes reference scripts, exercises, and real automation project frameworks.",
    },
    {
      q: "Do you help with resumes and job preparation?",
      a: "Yes — resume assistance, project placement, and guidance on interviews are included.",
    },
    {
      q: "Can companies request customized workflows or projects?",
      a: "Yes — corporate programs can include organization-specific automation development and code review.",
    },
    {
      q: "Do I get lifetime access to recordings?",
      a: "Recordings access remains available for 3-6 months depending on course level.",
    },
    {
      q: "Is certification provided?",
      a: "Yes — digital certification is provided after successful completion of the modules and project.",
    },
  ];

  /* ── shared input classes ── */
  const inputClasses =
    "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-slate-300 transition-all duration-200";

  return (
    <div className="min-h-screen flex flex-col bg-background">
<Navbar />

      {/* ────────── Hero ────────── */}
      <section className="relative py-20 md:py-28 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-slate-900 to-slate-950" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h5 className="text-accent font-semibold tracking-wide uppercase mb-4">
            Contact Us
          </h5>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have questions about our services or training? Ready to start a
            project? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ────────── Contact Info Cards Row ────────── */}
      <section className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Mail,
                label: "Email Us",
                value: "enquiry@cadivity.com",
                href: "mailto:enquiry@cadivity.com",
                color: "text-primary",
                border: "border-l-primary",
              },
              {
                icon: Phone,
                label: "Call Us",
                value: "+91-6372495858",
                href: "tel:+916372495858",
                color: "text-accent",
                border: "border-l-accent",
              },
              {
                icon: MapPin,
                label: "Location",
                value: "India",
                href: undefined,
                color: "text-green-600",
                border: "border-l-green-500",
              },
              {
                icon: Clock,
                label: "Business Hours",
                value: "Mon – Sat, 10 AM – 7 PM",
                href: undefined,
                color: "text-amber-600",
                border: "border-l-amber-500",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className={`border-l-4 ${item.border} shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <CardContent className="pt-5 pb-5 flex items-start gap-4">
                  <item.icon
                    className={`h-5 w-5 ${item.color} shrink-0 mt-0.5`}
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {item.label}
                    </h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-slate-600 text-sm hover:text-primary transition-colors"
                      >
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
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* ── Left: Contact Form (3/5) ── */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2.5 mb-8">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                  Send us a Message
                </h2>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Row 1: Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">
                            Full Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              className={inputClasses}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className={inputClasses}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Phone + Subject */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">
                            Phone Number{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+1 555 1234567"
                              className={inputClasses}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">
                            Subject / Inquiry Type{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Training Inquiry / Project Request"
                              className={inputClasses}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3: Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Message <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your requirements, questions, or how we can help..."
                            className={`min-h-36 resize-y ${inputClasses}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            {/* ── Right: FAQ (2/5) ── */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-8">
                Frequently Asked Questions
              </h2>

              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border border-slate-200 rounded-lg px-4 data-[state=open]:bg-slate-50 transition-colors duration-200"
                  >
                    <AccordionTrigger className="text-left font-medium text-slate-900 hover:text-primary transition-colors text-sm py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Success / Error Dialog ────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader className="items-center">
            {dialogType === "success" ? (
              <CheckCircle2 className="h-14 w-14 text-green-500 mb-3" />
            ) : (
              <XCircle className="h-14 w-14 text-red-500 mb-3" />
            )}
            <DialogTitle className="text-2xl font-display">
              {dialogType === "success"
                ? "Message Sent Successfully!"
                : "Something Went Wrong"}
            </DialogTitle>

            <DialogDescription className="mt-3 text-slate-600 text-base">
              {dialogType === "success"
                ? "Thanks for contacting Cadivity. We'll get back to you within 24 hours."
                : "We couldn't send your message right now. Please try again later or email us directly."}
            </DialogDescription>
          </DialogHeader>

          <Button
            onClick={() => setDialogOpen(false)}
            className={`mt-4 ${
              dialogType === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {dialogType === "success" ? "Got it!" : "Try Again"}
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
