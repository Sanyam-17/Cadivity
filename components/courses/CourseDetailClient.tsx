"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Home,
  PlayCircle,
  HelpCircle as QuizIcon,
  ShieldCheck,
  Users,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import { InstructorBio } from "@/components/courses/InstructorBio";
import { CourseFAQ } from "@/components/courses/CourseFAQ";
import { CourseReviews } from "@/components/courses/CourseReviews";

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
      isPreviewable?: boolean;
    }>;
  }>;
  enrolledStudents: number;
  sectionCount: number;
  totalLessons: number;
  isEnrolled: boolean;
  faq: Array<{ question: string; answer: string }> | null;
  instructorProfile: {
    bio: string | null;
    headline: string | null;
    website: string | null;
    linkedinUrl: string | null;
    expertise: string[];
  } | null;
  currentUserId: string | null;
}

/* ─── Helpers ─── */
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
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(() =>
    course.sections.length > 0 ? new Set([course.sections[0].id]) : new Set()
  );

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

  const totalDurationMinutes = Math.round(
    course.sections.reduce(
      (sum, s) => sum + s.lessons.reduce((lSum, l) => lSum + (l.duration || 0), 0),
      0
    ) / 60
  );

  const isComingSoon = course.ctaType === "coming_soon";
  const isContactUs = course.ctaType === "contact_us";
  const hasBrochure = !!course.brochureUrl;
  const hasDiscount =
    course.price != null &&
    course.originalPrice != null &&
    course.originalPrice > course.price;
  const discountPct = hasDiscount
    ? Math.round(((course.originalPrice! - course.price!) / course.originalPrice!) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden cad-bg-navy cad-section pt-28 sm:pt-32">
        {/* Blueprint decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div className="cad-circle-deco w-[250px] h-[250px] top-[10%] right-[5%] hidden lg:block" />
          <div className="cad-circle-deco w-[150px] h-[150px] top-[calc(10%+50px)] right-[calc(5%+50px)] hidden lg:block" />
        </div>

        <div ref={heroReveal.ref} className={cn("cad-container relative z-10 transition-all duration-700", heroReveal.visible ? "animate-fade-in-up" : "opacity-0")}>

          {/* ── Breadcrumb ── */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1.5 cad-text-mono text-white/40">
              <li>
                <Link href="/" className="flex items-center gap-1 hover:text-white/70 transition-colors">
                  <Home className="h-3 w-3" />
                  Home
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
              <li>
                <Link href="/courses" className="hover:text-white/70 transition-colors">
                  Programs
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
              <li className="text-white/70 truncate max-w-[200px]" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-[1fr_320px] gap-12 items-start">
            <div className="space-y-6">
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center gap-3">
                {course.category && (
                  <span className="cad-tag text-[var(--cad-sky)] border-[var(--cad-sky)]/30" style={{ fontSize: '10px' }}>
                    {course.category.name}
                  </span>
                )}
                {course.difficultyBadge && (
                  <span className="cad-badge cad-badge-level">
                    {course.difficultyBadge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="cad-text-display text-white" style={{ fontSize: 'clamp(2rem, 1rem + 4vw, 3.5rem)' }}>
                {course.title}
              </h1>

              {/* Tags */}
              {course.tags && (
                <p className="cad-text-mono text-[var(--cad-sky)]" style={{ fontSize: '12px' }}>
                  Tech Stack: <span className="text-white/60">{course.tags}</span>
                </p>
              )}

              {/* Short Description */}
              {course.shortDescription && (
                <p className="cad-text-body" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {course.shortDescription}
                </p>
              )}

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[var(--cad-hairline-dark)] cad-text-mono text-white/40">
                {course.instructor && (
                  <span className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[var(--cad-cobalt)] flex items-center justify-center text-[9px] font-bold text-white uppercase">
                      {course.instructor.name.slice(0, 2)}
                    </span>
                    <span className="text-white/60">{course.instructor.name}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[var(--cad-sky)]" />
                  <strong className="text-white/70">{course.enrolledStudents.toLocaleString("en-IN")}</strong> enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[var(--cad-sky)]" />
                  <strong className="text-white/70">{course.sections.length}</strong> sections · <strong className="text-white/70">{course.totalLessons}</strong> lessons
                </span>
                {totalDurationMinutes > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[var(--cad-sky)]" />
                    <strong className="text-white/70">{totalDurationMinutes}</strong> mins
                  </span>
                )}
              </div>
            </div>

            {/* Logo on the right */}
            <div className="hidden lg:flex items-center justify-center cad-card bg-white/5 border-[var(--cad-hairline-dark)] p-8 h-52 w-full">
              {course.logo ? (
                <img src={course.logo} alt={`${course.title} - course logo`} className="h-28 object-contain select-none max-w-full" />
              ) : (
                <div className="cad-text-mono text-white/20 text-2xl">CAD</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Grid ─── */}
      <section className="cad-bg-cream cad-section flex-1">
        <div ref={contentReveal.ref} className={cn("cad-container transition-all duration-700", contentReveal.visible ? "animate-fade-in-up" : "opacity-0")}>
          <div className="grid lg:grid-cols-[1fr_360px] gap-12 items-start">

            {/* ── Left Side ── */}
            <div className="space-y-16">

              {/* 1. Curriculum Accordion */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--cad-hairline)] pb-3">
                  <h2 className="cad-text-h2-bold text-[var(--cad-ink)]" style={{ fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)' }}>
                    Course Curriculum
                  </h2>
                  <p className="cad-text-mono text-[var(--cad-muted)]">
                    {course.sections.length} sections · {course.totalLessons} lessons · {totalDurationMinutes} mins
                  </p>
                </div>

                {course.sections.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[var(--cad-hairline)] text-[var(--cad-muted)] cad-text-mono">
                    No curriculum uploaded yet. Check back soon!
                  </div>
                ) : (
                  <div className="space-y-0" role="list">
                    {course.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => {
                        const isExpanded = expandedSections.has(section.id);
                        const sectionMinutes = Math.round(
                          section.lessons.reduce((sum, l) => sum + (l.duration || 0), 0) / 60
                        );
                        const panelId = `section-panel-${section.id}`;
                        return (
                          <div key={section.id} className="border border-[var(--cad-hairline)] border-b-0 last:border-b overflow-hidden" role="listitem">
                            <button
                              type="button"
                              onClick={() => toggleSection(section.id)}
                              aria-expanded={isExpanded}
                              aria-controls={panelId}
                              className="flex w-full items-center justify-between p-5 hover:bg-[var(--cad-sand)]/50 text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <ChevronRight className={cn("h-4 w-4 text-[var(--cad-muted)] transition-transform duration-200", isExpanded && "rotate-90 text-[var(--cad-cobalt)]")} aria-hidden="true" />
                                <div>
                                  <h3 className="font-semibold text-[var(--cad-ink)] text-base" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>{section.title}</h3>
                                  <p className="cad-text-mono text-[var(--cad-muted)] mt-1" style={{ fontSize: '10px' }}>
                                    {section.lessons.length} lessons · {sectionMinutes} mins
                                  </p>
                                </div>
                              </div>
                            </button>

                            <div
                              id={panelId}
                              hidden={!isExpanded}
                              className="border-t border-[var(--cad-hairline)] bg-white divide-y divide-[var(--cad-hairline)]"
                            >
                              {section.lessons.length === 0 ? (
                                <div className="p-5 text-center cad-text-mono text-[var(--cad-muted)]">
                                  No lessons inside this section yet.
                                </div>
                              ) : (
                                section.lessons
                                  .sort((a, b) => a.order - b.order)
                                  .map((lesson) => {
                                    const isVideo = lesson.type === "video";
                                    const isQuiz = lesson.type === "quiz";
                                    return (
                                      <div key={lesson.id} className="flex items-center justify-between px-6 py-4 pl-12 hover:bg-[var(--cad-cream)]/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                          {isVideo ? (
                                            <PlayCircle className="h-4 w-4 text-[var(--cad-cobalt)] shrink-0" aria-hidden="true" />
                                          ) : isQuiz ? (
                                            <QuizIcon className="h-4 w-4 text-[var(--cad-teal)] shrink-0" aria-hidden="true" />
                                          ) : (
                                            <FileText className="h-4 w-4 text-[var(--cad-muted)] shrink-0" aria-hidden="true" />
                                          )}
                                          <span className="text-[var(--cad-ink)] text-sm font-light" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>{lesson.title}</span>
                                          {lesson.isPreviewable && (
                                            <span className="cad-badge bg-[var(--cad-success)]/10 text-[var(--cad-success)] flex items-center gap-1">
                                              <Eye className="h-2.5 w-2.5" aria-hidden="true" />
                                              Preview
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                          {lesson.duration && (
                                            <span className="cad-text-mono text-[var(--cad-muted)] flex items-center gap-1" style={{ fontSize: '10px' }}>
                                              <Clock className="h-3 w-3" aria-hidden="true" />
                                              {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, "0")}
                                            </span>
                                          )}
                                          <span
                                            className="cad-badge bg-[var(--cad-sand)] text-[var(--cad-muted)]"
                                            aria-label={`${lesson.type} lesson`}
                                          >
                                            {lesson.type}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* 2. About Course */}
              {course.description && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-[var(--cad-cobalt)]" />
                    <h2 className="cad-text-h2-bold text-[var(--cad-ink)]" style={{ fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)' }}>
                      About This Course
                    </h2>
                  </div>
                  <div className="cad-card cad-card-sand p-6 md:p-8 text-[var(--cad-ink)] leading-relaxed text-base">
                    {course.description.includes("<") && course.description.includes(">") ? (
                      <div
                        className="prose-slate max-w-none space-y-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description) }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap space-y-4" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>{course.description}</div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. What You'll Learn */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="cad-card cad-card-ice p-6 md:p-8 space-y-4">
                  <h2 className="cad-text-h2-bold text-[var(--cad-ink)]" style={{ fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)' }}>
                    What You&apos;ll Learn
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    {course.whatYouWillLearn.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[var(--cad-ink)] text-sm font-light" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                        <CheckCircle2 className="h-4 w-4 text-[var(--cad-success)] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-[var(--cad-cobalt)]" />
                    <h2 className="cad-text-h2-bold text-[var(--cad-ink)]" style={{ fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)' }}>
                      Course Prerequisites
                    </h2>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    {course.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-[var(--cad-ink)] font-light text-base" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                        <span className="cad-badge bg-[var(--cad-cobalt)] text-white w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Who Is This For */}
              {course.whoIsThisFor && course.whoIsThisFor.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-[var(--cad-cobalt)]" />
                    <h2 className="cad-text-h2-bold text-[var(--cad-ink)]" style={{ fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)' }}>
                      Who Is This Course For?
                    </h2>
                  </div>
                  <div className="space-y-3 pt-2">
                    {course.whoIsThisFor.map((audience, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[var(--cad-ink)] font-light text-base" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                        <span className="text-[var(--cad-cobalt)] shrink-0 mt-0.5" aria-hidden="true">→</span>
                        <span>{audience}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Instructor Bio */}
              {course.instructor && (
                <InstructorBio
                  instructor={course.instructor}
                  profile={course.instructorProfile ?? null}
                />
              )}

              {/* 7. FAQ */}
              {course.faq && course.faq.length > 0 && (
                <CourseFAQ faq={course.faq} courseTitle={course.title} />
              )}

              {/* 8. Reviews */}
              <CourseReviews
                slug={course.slug}
                isEnrolled={course.isEnrolled}
                currentUserId={course.currentUserId ?? undefined}
              />
            </div>

            {/* ── Right Side — STICKY PRICING CARD ── */}
            <div className="sticky top-24 space-y-6 hidden lg:block">
              <PricingCard course={course} isComingSoon={isComingSoon} isContactUs={isContactUs} hasBrochure={hasBrochure} discountPct={discountPct} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile sticky bottom pricing bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--cad-hairline)] shadow-lg px-4 py-3 flex items-center gap-3">
        {course.price != null && (
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-lg font-bold text-[var(--cad-ink)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>{formatPrice(course.price)}</span>
            {course.originalPrice != null && (
              <span className="text-sm text-[var(--cad-muted)] line-through" aria-hidden="true">{formatPrice(course.originalPrice)}</span>
            )}
          </div>
        )}
        <div className="flex-1">
          {course.isEnrolled ? (
            <Link href="/dashboard/student" className="block w-full">
              <button className="cad-btn cad-btn-primary w-full">Go to Dashboard</button>
            </Link>
          ) : isContactUs ? (
            <Link href="/contact" className="block w-full">
              <button className="cad-btn cad-btn-cobalt w-full">Contact Us</button>
            </Link>
          ) : isComingSoon ? (
            <button className="cad-btn cad-btn-dark w-full" disabled>Coming Soon</button>
          ) : (
            <Link href={`/checkout/${course.slug}`} className="block w-full">
              <button className="cad-btn cad-btn-primary w-full">Enroll Now <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" /></button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Extracted Pricing Card ─── */
function PricingCard({
  course,
  isComingSoon,
  isContactUs,
  hasBrochure,
  discountPct,
}: {
  course: CourseDetailData;
  isComingSoon: boolean;
  isContactUs: boolean;
  hasBrochure: boolean;
  discountPct: number;
}) {
  return (
    <div className="cad-card cad-card-sand overflow-hidden">
      {/* Top accent line */}
      <div className="h-1 w-full bg-[var(--cad-amber)]" />

      <div className="p-6 space-y-6">
        {/* Pricing */}
        {(course.price != null || course.originalPrice != null) && (
          <div className="space-y-1">
            <p className="cad-text-mono text-[var(--cad-muted)]" style={{ fontSize: '10px' }}>Course Tuition:</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              {course.price != null && (
                <span className="text-3xl font-extrabold text-[var(--cad-ink)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                  {formatPrice(course.price)}
                </span>
              )}
              {course.originalPrice != null && (
                <>
                  <span className="text-base text-[var(--cad-muted)] line-through" aria-hidden="true">
                    {formatPrice(course.originalPrice)}
                  </span>
                  <span className="sr-only">
                    Original price: {formatPrice(course.originalPrice)}
                  </span>
                </>
              )}
              {discountPct > 0 && (
                <span className="cad-badge cad-badge-discount">
                  {discountPct}% OFF
                </span>
              )}
            </div>
            {discountPct > 0 && (
              <p className="cad-text-mono text-[var(--cad-success)] mt-1" style={{ fontSize: '10px' }}>
                You save {discountPct}% on this program
              </p>
            )}
          </div>
        )}

        {/* Key features checklist */}
        {course.keyFeatures && course.keyFeatures.length > 0 && (
          <div className="border-t border-b border-[var(--cad-hairline)] py-4 space-y-2">
            <p className="cad-text-mono text-[var(--cad-muted)] mb-3" style={{ fontSize: '10px' }}>This course includes:</p>
            <ul className="space-y-2.5">
              {course.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start text-sm text-[var(--cad-ink)] font-light" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                  <ShieldCheck className="h-4 w-4 text-[var(--cad-cobalt)] mr-2 shrink-0 mt-0.5" aria-hidden="true" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA buttons */}
        <div className="space-y-3">
          {course.isEnrolled ? (
            <Link href="/dashboard/student" className="block w-full">
              <button className="cad-btn cad-btn-primary w-full">
                Go to Dashboard (Enrolled)
              </button>
            </Link>
          ) : isContactUs ? (
            <Link href="/contact" className="block w-full">
              <button className="cad-btn cad-btn-cobalt w-full">
                Contact Us
                <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
              </button>
            </Link>
          ) : isComingSoon ? (
            <button className="cad-btn cad-btn-dark w-full" disabled>
              Coming Soon…
            </button>
          ) : (
            <Link href={`/checkout/${course.slug}`} className="block w-full">
              <button className="cad-btn cad-btn-primary w-full">
                Enroll Now
                <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
              </button>
            </Link>
          )}

          {/* Download brochure */}
          {!isContactUs && hasBrochure && !isComingSoon && (
            <a
              href={course.brochureUrl!}
              download={`${course.slug}-brochure.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <button className="cad-btn cad-btn-outline text-[var(--cad-ink)] border-[var(--cad-hairline)] w-full">
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Download Brochure
              </button>
            </a>
          )}
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 cad-text-mono text-[var(--cad-muted)] pt-1" style={{ fontSize: '10px' }}>
          <Award className="h-3 w-3 text-[var(--cad-amber)]" aria-hidden="true" />
          <span>Certificate of Completion included</span>
        </div>
        <p className="text-center cad-text-mono text-[var(--cad-muted)] -mt-3" style={{ fontSize: '9px' }}>
          Instant access · Secure checkout · Life-time access
        </p>
      </div>
    </div>
  );
}
