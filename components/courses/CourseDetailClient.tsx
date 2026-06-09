"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  PlayCircle,
  HelpCircle as QuizIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

interface CourseDetailData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  logo: string | null;
  difficultyBadge: string | null;
  tags: string | null;
  keyFeatures: string[];
  ctaType: string;
  brochureUrl: string | null;
  price: number | null;
  originalPrice: number | null;
  whatYouWillLearn: string[];
  requirements: string[];
  whoIsThisFor: string[];
  instructor: { id: string; name: string; image: string | null } | null;
  category: { id: string; name: string } | null;
  sections: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number | null;
      order: number;
    }>;
  }>;
  enrolledStudents: number;
  sectionCount: number;
  isEnrolled: boolean;
}

/* ─── Helpers ─── */

function getDifficultyColor(badge: string | null | undefined): string {
  switch (badge) {
    case "Beginner/Inter":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "Intermediate":
      return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    case "Advanced":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Expert":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "Custom":
      return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    default:
      return "bg-primary/10 text-primary border-primary/20";
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/* ─── Main Client Component ─── */

export default function CourseDetailClient({ course }: { course: CourseDetailData }) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(() => {
    return course.sections.length > 0 ? new Set([course.sections[0].id]) : new Set();
  });

  const heroReveal = useScrollReveal();
  const contentReveal = useScrollReveal();

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const totalDurationMinutes = Math.round(
    course.sections.reduce(
      (sum, s) => sum + s.lessons.reduce((lSum, l) => lSum + (l.duration || 0), 0),
      0
    ) / 60
  );

  const isComingSoon = course.ctaType === "coming_soon";
  const isContactUs = course.ctaType === "contact_us";
  const hasBrochure = !!course.brochureUrl;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800/60 py-20 sm:py-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-20 right-10 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20" aria-hidden="true">
          <div className="absolute top-12 right-[10%] w-14 h-14 rounded-2xl bg-white/5 border border-white/10 animate-float" style={{ animationDuration: "12s" }} />
          <div className="absolute bottom-16 left-[8%] w-10 h-10 rounded-full bg-white/5 border border-white/10 animate-float delay-1000" style={{ animationDuration: "15s" }} />
        </div>

        <div ref={heroReveal.ref} className={cn("container relative z-10 mx-auto max-w-6xl px-4 transition-all duration-700", heroReveal.visible ? "animate-fade-in-up" : "opacity-0")}>
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-center">
            <div className="space-y-6">
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center gap-3">
                {course.category && (
                  <span className="text-xs font-semibold tracking-wider text-accent uppercase bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                    {course.category.name}
                  </span>
                )}
                {course.difficultyBadge && (
                  <Badge variant="outline" className={cn("rounded-full border font-medium px-3 py-0.5", getDifficultyColor(course.difficultyBadge))}>
                    {course.difficultyBadge}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {course.title}
              </h1>

              {/* Tags */}
              {course.tags && (
                <p className="text-sm font-semibold tracking-wide text-primary">
                  Tech Stack: <span className="text-slate-300 font-medium">{course.tags}</span>
                </p>
              )}

              {/* Short Description */}
              {course.shortDescription && (
                <p className="text-lg text-slate-300 leading-relaxed max-w-2xl font-light">
                  {course.shortDescription}
                </p>
              )}

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800/40 text-sm text-slate-400">
                {course.instructor && (
                  <span className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white uppercase border border-slate-700">
                      {course.instructor.name.slice(0, 2)}
                    </span>
                    Instructor: <strong className="text-slate-200 font-medium">{course.instructor.name}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  <strong>{course.enrolledStudents}</strong> students enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <strong>{course.sections.length}</strong> sections · <strong>{totalLessons}</strong> lessons
                </span>
              </div>
            </div>

            {/* Logo/Icon on the right */}
            <div className="hidden lg:flex items-center justify-center bg-slate-950/40 border border-slate-800 rounded-3xl p-8 backdrop-blur shadow-2xl h-56 w-full">
              {course.logo ? (
                <img src={course.logo} alt={`${course.title} - course logo`} className="h-32 object-contain select-none max-w-full" />
              ) : (
                <div className="text-slate-600 font-bold font-display text-4xl">CAD</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Grid ─── */}
      <section className="py-12 sm:py-16 bg-white text-slate-900 flex-1 border-t border-slate-200">
        <div ref={contentReveal.ref} className={cn("container mx-auto max-w-6xl px-4 transition-all duration-700", contentReveal.visible ? "animate-fade-in-up" : "opacity-0")}>
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            
            {/* Left Side details */}
            <div className="space-y-12">
              
              {/* 1. Curriculum Accordion */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900">
                    Course Curriculum
                  </h2>
                  <p className="text-sm text-slate-500">
                    {course.sections.length} sections · {totalLessons} lessons · {totalDurationMinutes} mins total duration
                  </p>
                </div>

                {course.sections.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-500">
                    No curriculum uploaded yet. Check back soon!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => {
                        const isExpanded = expandedSections.has(section.id);
                        const sectionMinutes = Math.round(
                          section.lessons.reduce((sum, l) => sum + (l.duration || 0), 0) / 60
                        );
                        return (
                          <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 overflow-hidden transition-all duration-300 shadow-sm">
                            <button
                               type="button"
                               onClick={() => toggleSection(section.id)}
                               className="flex w-full items-center justify-between p-5 hover:bg-slate-100/60 text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <ChevronRight className={cn("h-4 w-4 text-slate-500 transition-transform duration-300", isExpanded && "rotate-90 text-primary")} />
                                <div>
                                  <h3 className="font-semibold text-slate-900 text-base md:text-lg">{section.title}</h3>
                                  <p className="text-xs text-slate-500 mt-1 font-light">
                                    {section.lessons.length} lessons · {sectionMinutes} mins
                                  </p>
                                </div>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="border-t border-slate-200 bg-white divide-y divide-slate-100">
                                {section.lessons.length === 0 ? (
                                  <div className="p-5 text-center text-sm text-slate-400 font-light italic">
                                    No lessons inside this section yet.
                                  </div>
                                ) : (
                                  section.lessons
                                    .sort((a, b) => a.order - b.order)
                                    .map((lesson) => {
                                      const isVideo = lesson.type === "video";
                                      const isQuiz = lesson.type === "quiz";
                                      return (
                                        <div key={lesson.id} className="flex items-center justify-between px-6 py-4 pl-12 hover:bg-slate-50 transition-colors">
                                          <div className="flex items-center gap-3">
                                            {isVideo ? (
                                              <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                                            ) : isQuiz ? (
                                              <QuizIcon className="h-4 w-4 text-accent shrink-0" />
                                            ) : (
                                              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                            )}
                                            <span className="text-slate-700 text-sm md:text-base font-light">{lesson.title}</span>
                                          </div>
                                          <div className="flex items-center gap-3 shrink-0">
                                            {lesson.duration && (
                                              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono font-light">
                                                <Clock className="h-3 w-3" />
                                                {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, "0")}
                                              </span>
                                            )}
                                            <span className="text-[10px] uppercase font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded tracking-wide scale-90 select-none">
                                              {lesson.type}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* 2. About Course / Long Description */}
              {course.description && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 border-l-4 border-primary pl-4">
                    About This Course
                  </h2>
                  <div className="bg-slate-50 text-slate-800 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm leading-relaxed text-base md:text-lg font-normal">
                    {course.description.includes("<") && course.description.includes(">") ? (
                      <div 
                        className="prose-slate max-w-none space-y-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold" 
                        dangerouslySetInnerHTML={{ __html: course.description }} 
                      />
                    ) : (
                      <div className="whitespace-pre-wrap space-y-4">
                        {course.description}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. What You'll Learn Grid */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900">
                    What You&apos;ll Learn
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    {course.whatYouWillLearn.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-slate-700 text-sm md:text-base font-light">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Requirements List */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 border-l-4 border-primary pl-4">
                    Course Prerequisites
                  </h2>
                  <div className="space-y-2.5 pt-2">
                    {course.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-slate-700 font-light text-base">
                        <span className="h-5 w-5 rounded-full bg-slate-100 text-primary text-xs font-semibold flex items-center justify-center border border-slate-200 shrink-0 mt-0.5 select-none">
                          {idx + 1}
                        </span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Who Is This Course For */}
              {course.whoIsThisFor && course.whoIsThisFor.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 border-l-4 border-primary pl-4">
                    Who Is This Course For?
                  </h2>
                  <div className="space-y-3 pt-2">
                    {course.whoIsThisFor.map((audience, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-slate-700 font-light text-base">
                        <span className="text-primary text-md shrink-0 mt-0.5">→</span>
                        <span>{audience}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Side - STICKY PRICING / PAYMENT CARD */}
            <div className="sticky top-28 space-y-6">
              <Card className="border-slate-200 bg-white shadow-2xl overflow-hidden rounded-3xl animate-fade-in-up">
                
                {/* Visual Accent top bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
                
                <CardContent className="p-6 space-y-6">
                  {/* Pricing section */}
                  {(course.price != null || course.originalPrice != null) && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course Tuition:</p>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        {course.price != null && (
                          <span className="text-3xl font-extrabold text-slate-900 font-display">
                            {formatPrice(course.price)}
                          </span>
                        )}
                        {course.originalPrice != null && (
                          <span className="text-base text-slate-400 line-through">
                            {formatPrice(course.originalPrice)}
                          </span>
                        )}
                      </div>
                      {course.price != null && course.originalPrice != null && (
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                          You save {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% on this program
                        </p>
                      )}
                    </div>
                  )}

                  {/* Highlights checklist inside sticky */}
                  {course.keyFeatures && course.keyFeatures.length > 0 && (
                    <div className="border-t border-b border-slate-100 py-4 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">This course includes:</p>
                      <ul className="space-y-2.5">
                        {course.keyFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start text-xs md:text-sm text-slate-700 font-light">
                            <ShieldCheck className="h-4.5 w-4.5 text-primary mr-2 shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA button actions */}
                  <div className="space-y-3">
                    {course.isEnrolled ? (
                      <Link href="/dashboard/student" className="block w-full">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-all duration-300">
                          Go to Dashboard (Enrolled)
                        </Button>
                      </Link>
                    ) : isContactUs ? (
                      <Link href="/contact" className="block w-full">
                        <Button className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          Contact Us
                        </Button>
                      </Link>
                    ) : isComingSoon ? (
                      <Button className="w-full bg-slate-800 text-slate-500 cursor-not-allowed rounded-xl" disabled>
                        Coming Soon...
                      </Button>
                    ) : (
                      <Link href={`/checkout/${course.slug}`} className="block w-full">
                        <Button className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          Enroll Now
                        </Button>
                      </Link>
                    )}

                    {/* Download brochure */}
                    {!isContactUs && hasBrochure && !isComingSoon && (
                      <a href={course.brochureUrl!} download={`${course.slug}-brochure.pdf`} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                          <Download className="mr-2 h-4 w-4" />
                          Download Brochure
                        </Button>
                      </a>
                    )}
                  </div>

                  {/* Badging of guarantee */}
                  <p className="text-center text-[10px] text-slate-400 font-light select-none">
                    Instant access · Secure sandbox checkout · Life-time access
                  </p>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
