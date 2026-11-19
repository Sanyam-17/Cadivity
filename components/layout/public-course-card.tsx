"use client";

import { Award, Check, Download, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  logo?: string | null;
  difficultyBadge?: string | null;
  tags?: string | null;
  keyFeatures: string[];
  ctaType: string;
  brochureUrl?: string | null;
  price?: number | null;
  originalPrice?: number | null;
  thumbnail?: string | null;
  /* extended social-proof fields (optional for backwards-compat) */
  enrollmentCount?: number;
  instructorName?: string | null;
  categoryName?: string | null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

interface PublicCourseCardProps {
  course: PublicCourse;
  index?: number;
  isPreview?: boolean;
}

export function PublicCourseCard({
  course,
  index = 0,
  isPreview = false,
}: PublicCourseCardProps) {
  const hasBrochure = !!course.brochureUrl;
  const isComingSoon = course.ctaType === "coming_soon";
  const isContactUs = course.ctaType === "contact_us";
  const isFree = course.price === 0 || course.price == null;
  const hasDiscount =
    course.price != null &&
    course.originalPrice != null &&
    course.originalPrice > course.price;
  const discountPct = hasDiscount
    ? Math.round(((course.originalPrice! - course.price!) / course.originalPrice!) * 100)
    : 0;

  return (
    <div className="cad-card bg-white flex flex-col h-full group">
      {/* ─── Header: Logo + Badges ─── */}
      <div className="bg-[var(--cad-sand)] border-b border-[var(--cad-hairline)] p-5">
        <div className="flex justify-between items-start mb-4">
          {/* Software Logo */}
          <span className="block">
            {course.logo ? (
              <img
                src={course.logo}
                alt={`${course.title} logo`}
                className="w-full h-16 object-contain"
                style={{ maxWidth: 180 }}
              />
            ) : (
              <div className="w-[180px] h-16 bg-[var(--cad-cream)] flex items-center justify-center">
                <span className="cad-text-mono text-[var(--cad-muted)]">
                  No logo
                </span>
              </div>
            )}
          </span>

          {/* Right badges stack */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Free / Paid badge */}
            {!isComingSoon && (
              isFree ? (
                <span className="cad-badge bg-[var(--cad-success)] text-white">
                  FREE
                </span>
              ) : (
                hasDiscount && (
                  <span className="cad-badge cad-badge-discount">
                    {discountPct}% OFF
                  </span>
                )
              )
            )}
            {/* Difficulty badge */}
            {course.difficultyBadge && (
              <span className="cad-badge cad-badge-level">
                {course.difficultyBadge}
              </span>
            )}
          </div>
        </div>

        {/* Category */}
        {course.categoryName && (
          <p className="cad-text-mono text-[var(--cad-muted)] mb-1" style={{ fontSize: '10px' }}>
            {course.categoryName}
          </p>
        )}

        {/* Title */}
        <h3 className="cad-text-h3 text-[var(--cad-ink)] group-hover:text-[var(--cad-cobalt)] transition-colors duration-200">
          {course.title || "Untitled Course"}
        </h3>

        {/* Tags */}
        {course.tags && (
          <p className="cad-text-mono text-[var(--cad-teal)] mt-1.5" style={{ fontSize: '10px' }}>
            {course.tags}
          </p>
        )}

        {/* Instructor + Enrollment meta */}
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[var(--cad-hairline)]">
          {course.instructorName && (
            <p className="text-xs text-[var(--cad-muted)] truncate" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              By <span className="font-medium text-[var(--cad-ink)]">{course.instructorName}</span>
            </p>
          )}
          {typeof course.enrollmentCount === "number" && course.enrollmentCount > 0 && (
            <p className="text-xs text-[var(--cad-muted)] flex items-center gap-1 shrink-0" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
              <Users className="h-3 w-3" />
              {course.enrollmentCount.toLocaleString("en-IN")} enrolled
            </p>
          )}
        </div>
      </div>

      {/* ─── Content: Description + Features ─── */}
      <div className="flex-1 p-5 space-y-4">
        {/* Short Description */}
        {course.shortDescription && (
          <p className="text-sm text-[var(--cad-muted)] leading-relaxed" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
            {course.shortDescription}
          </p>
        )}

        {/* Key Features */}
        {course.keyFeatures && course.keyFeatures.length > 0 && (
          <div className="space-y-2">
            <h4 className="cad-text-mono text-[var(--cad-ink)]" style={{ fontSize: '10px' }}>
              Key Features:
            </h4>
            <ul className="space-y-1.5">
              {course.keyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm text-[var(--cad-muted)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                  <Check className="h-3 w-3 text-[var(--cad-success)] mr-2 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Certificate badge */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--cad-muted)] mt-auto">
          <Award className="h-3.5 w-3.5 text-[var(--cad-amber)]" />
          Certificate of Completion
        </div>

        {/* Price */}
        {!isFree && (course.price != null || course.originalPrice != null) && (
          <div className="flex items-baseline gap-2 mt-2">
            {course.price != null && (
              <span className="text-lg font-bold text-[var(--cad-ink)]" style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}>
                {formatPrice(course.price)}
              </span>
            )}
            {course.originalPrice != null && (
              <>
                <span className="text-sm text-[var(--cad-muted)] line-through" aria-hidden="true">
                  {formatPrice(course.originalPrice)}
                </span>
                <span className="sr-only">
                  Original price: {formatPrice(course.originalPrice)}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── Footer: CTA + Download ─── */}
      <div className="p-5 pt-0">
        <div className="flex gap-3">
          {/* Primary CTA Button */}
          {isContactUs ? (
            isPreview ? (
              <button className="cad-btn cad-btn-dark flex-1">
                Contact Us
                <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
              </button>
            ) : (
              <Link href="/contact" className="flex-1">
                <button className="cad-btn cad-btn-dark w-full">
                  Contact Us
                  <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
                </button>
              </Link>
            )
          ) : isComingSoon ? (
            <button
              className="cad-btn cad-btn-dark flex-1"
              disabled
            >
              Coming Soon…
            </button>
          ) : isPreview ? (
            <button className="cad-btn cad-btn-dark flex-1">
              Enroll Now
              <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
            </button>
          ) : (
            <Link href={`/courses/${course.slug}`} className="flex-1">
              <button className="cad-btn cad-btn-dark w-full">
                View Course
                <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
              </button>
            </Link>
          )}

          {/* Download Brochure Button */}
          {!isContactUs &&
            (hasBrochure && !isComingSoon ? (
              isPreview ? (
                <button
                  title="Download Brochure"
                  className="cad-btn cad-btn-outline text-[var(--cad-ink)] border-[var(--cad-hairline)] px-3"
                >
                  <Download className="h-4 w-4" />
                </button>
              ) : (
                <a
                  href={course.brochureUrl!}
                  download={`${course.slug}-brochure.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    title="Download Brochure"
                    aria-label="Download course brochure"
                    className="cad-btn cad-btn-outline text-[var(--cad-ink)] border-[var(--cad-hairline)] px-3"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </a>
              )
            ) : (
              <button
                title={isComingSoon ? "Coming Soon" : "No brochure"}
                aria-label={isComingSoon ? "Brochure coming soon" : "No brochure available"}
                disabled
                className="cad-btn cad-btn-outline text-[var(--cad-muted)] border-[var(--cad-hairline)] px-3"
              >
                <Download className="h-4 w-4" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
