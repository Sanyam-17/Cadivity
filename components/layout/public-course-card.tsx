"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Award, Check, Download, Users } from "lucide-react";
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

function getDifficultyColor(badge: string | null | undefined): string {
  switch (badge) {
    case "Beginner/Inter":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Intermediate":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "Advanced":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Expert":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "Custom":
      return "bg-violet-100 text-violet-700 border-violet-200";
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
    <Card
      className="flex flex-col overflow-hidden border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group hover:-translate-y-1 animate-fade-in-up h-full"
      style={{ animationDelay: `${index * 100 + 100}ms` }}
    >
      {/* ─── Header: Logo + Badges ─── */}
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <div className="flex justify-between items-start mb-4">
          {/* Software Logo */}
          <span className="block">
            {course.logo ? (
              <img
                src={course.logo}
                alt={`${course.title} logo`}
                className="w-full h-20 object-contain"
                style={{ maxWidth: 200 }}
              />
            ) : (
              <div className="w-[200px] h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 text-sm font-medium">
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
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[10px] font-bold px-2 py-0.5">
                  FREE
                </Badge>
              ) : (
                hasDiscount && (
                  <Badge className="bg-red-100 text-red-600 border-red-200 border text-[10px] font-bold px-2 py-0.5">
                    {discountPct}% OFF
                  </Badge>
                )
              )
            )}
            {/* Difficulty badge */}
            {course.difficultyBadge && (
              <Badge
                variant="secondary"
                className={`${getDifficultyColor(course.difficultyBadge)} hover:opacity-90 text-[10px]`}
              >
                {course.difficultyBadge}
              </Badge>
            )}
          </div>
        </div>

        {/* Category */}
        {course.categoryName && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {course.categoryName}
          </p>
        )}

        {/* Title */}
        <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">
          {course.title || "Untitled Course"}
        </h3>

        {/* Tags */}
        {course.tags && (
          <p className="text-sm font-medium text-accent mt-1">{course.tags}</p>
        )}

        {/* Instructor + Enrollment meta */}
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-100">
          {course.instructorName && (
            <p className="text-xs text-slate-500 truncate">
              By <span className="font-medium text-slate-700">{course.instructorName}</span>
            </p>
          )}
          {typeof course.enrollmentCount === "number" && course.enrollmentCount > 0 && (
            <p className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
              <Users className="h-3 w-3" />
              {course.enrollmentCount.toLocaleString("en-IN")} enrolled
            </p>
          )}
        </div>
      </CardHeader>

      {/* ─── Content: Description + Features ─── */}
      <CardContent className="flex-1 pt-6">
        {/* Short Description */}
        {course.shortDescription && (
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {course.shortDescription}
          </p>
        )}

        {/* Key Features */}
        {course.keyFeatures && course.keyFeatures.length > 0 && (
          <div className="space-y-2 mb-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Key Features:
            </h4>
            <ul className="text-sm text-slate-600 space-y-1">
              {course.keyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start group/item">
                  <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 transition-transform duration-300 group-hover/item:scale-125 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Certificate badge */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-auto">
          <Award className="h-3.5 w-3.5 text-amber-500" />
          Certificate of Completion
        </div>

        {/* Price */}
        {!isFree && (course.price != null || course.originalPrice != null) && (
          <div className="flex items-baseline gap-2 mt-3">
            {course.price != null && (
              <span className="text-lg font-bold text-slate-900">
                {formatPrice(course.price)}
              </span>
            )}
            {course.originalPrice != null && (
              <>
                <span className="text-sm text-slate-400 line-through" aria-hidden="true">
                  {formatPrice(course.originalPrice)}
                </span>
                <span className="sr-only">
                  Original price: {formatPrice(course.originalPrice)}
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* ─── Footer: CTA + Download ─── */}
      <CardFooter className="pt-0 pb-6">
        <div className="w-full flex gap-3">
          {/* Primary CTA Button */}
          {isContactUs ? (
            isPreview ? (
              <Button className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                Contact Us
              </Button>
            ) : (
              <Link href="/contact" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  Contact Us
                </Button>
              </Link>
            )
          ) : isComingSoon ? (
            <Button
              className="flex-1 bg-slate-300 text-slate-500 cursor-not-allowed"
              disabled
            >
              Coming Soon…
            </Button>
          ) : isPreview ? (
            <Button className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              Enroll Now
            </Button>
          ) : (
            <Link href={`/courses/${course.slug}`} className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                View Course
              </Button>
            </Link>
          )}

          {/* Download Brochure Button */}
          {!isContactUs &&
            (hasBrochure && !isComingSoon ? (
              isPreview ? (
                <Button
                  variant="outline"
                  size="icon"
                  title="Download Brochure"
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <Download className="h-4 w-4" />
                </Button>
              ) : (
                <a
                  href={course.brochureUrl!}
                  download={`${course.slug}-brochure.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    title="Download Brochure"
                    aria-label="Download course brochure"
                    className="hover:scale-110 transition-transform duration-300"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              )
            ) : (
              <Button
                variant="outline"
                size="icon"
                title={isComingSoon ? "Coming Soon" : "No brochure"}
                aria-label={isComingSoon ? "Brochure coming soon" : "No brochure available"}
                disabled
                className="opacity-40 cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
              </Button>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}
