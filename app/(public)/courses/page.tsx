import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/server/db";
import type { PublicCourse } from "@/components/layout/public-course-card";
import {
  CoursesHeroClient,
  CoursesGridClient,
  CoursesComparisonClient,
} from "@/components/courses/CoursesClientShell";

/* ─── ISR: rebuild at most once per hour ─── */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "CAD Automation Training Programs | Cadivity",
  description:
    "Practical, industry-oriented CAD automation training. Master Creo Toolkit, SolidWorks API, NX Open, and more with real-world projects.",
  openGraph: {
    title: "CAD Automation Training Programs | Cadivity",
    description:
      "Practical, industry-oriented CAD automation training. Master Creo Toolkit, SolidWorks API, NX Open, and more with real-world projects.",
    url: "https://www.cadivity.com/courses",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cadivity Courses" }],
  },
  alternates: {
    canonical: "https://www.cadivity.com/courses",
  },
};

/* ─── Extended course type with social-proof fields ─── */
export type PublicCourseWithMeta = PublicCourse & {
  enrollmentCount: number;
  instructorName: string | null;
  categoryName: string | null;
};

async function getPublishedCourses(): Promise<PublicCourseWithMeta[]> {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "published" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        logo: true,
        difficultyBadge: true,
        tags: true,
        keyFeatures: true,
        ctaType: true,
        brochureUrl: true,
        price: true,
        originalPrice: true,
        thumbnail: true,
        instructor: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
      logo: c.logo,
      difficultyBadge: c.difficultyBadge,
      tags: c.tags,
      keyFeatures: c.keyFeatures,
      ctaType: c.ctaType,
      brochureUrl: c.brochureUrl,
      price: c.price,
      originalPrice: c.originalPrice,
      thumbnail: c.thumbnail,
      enrollmentCount: (c as any)._count?.enrollments ?? 0,
      instructorName: c.instructor?.name ?? null,
      categoryName: c.category?.name ?? null,
    }));
  } catch (error) {
    console.error("Failed to fetch published courses:", error);
    return [];
  }
}

export default async function Courses() {
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CoursesHeroClient />
      <Suspense fallback={null}>
        <CoursesGridClient courses={courses} />
      </Suspense>
      <CoursesComparisonClient />
    </div>
  );
}
