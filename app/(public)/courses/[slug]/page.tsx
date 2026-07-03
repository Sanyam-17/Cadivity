import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/db";
import { getSession } from "@/lib/server/auth-guard";
import { getUserRole, ROLES } from "@/lib/roles";
import CourseDetailClient from "@/components/courses/CourseDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedCourses } from "@/components/courses/RelatedCourses";

/* ─── ISR: rebuild at most once per hour ─── */
export const revalidate = 3600;

/* ─── Pre-build all published slugs at deploy time ─── */
export async function generateStaticParams() {
  const courses = await prisma.course.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return courses.map((c) => ({ slug: c.slug }));
}

/* ─────────────────────────────────────────────────────────────────────────────
   react/cache deduplicates this within a single request — both generateMetadata
   and the page component call it, but only ONE Prisma query is executed.
───────────────────────────────────────────────────────────────────────────── */
const getCourseBySlug = cache(async (slug: string) => {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { id: true, name: true, image: true } },
      category: { select: { id: true, name: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      _count: { select: { enrollments: true } } as any,
    },
  });
});

/* ─── generateMetadata ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return { title: "Course Not Found | Cadivity" };
  }

  const title = `${course.seoTitle ?? course.title} | Cadivity`;
  const description =
    course.seoDescription ??
    course.shortDescription ??
    `Learn ${course.title} with hands-on CAD automation training at Cadivity.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.cadivity.com/courses/${slug}`,
      images: course.thumbnail
        ? [{ url: course.thumbnail, width: 1200, height: 630, alt: course.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cadivity" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: course.thumbnail ? [course.thumbnail] : ["/og-image.png"],
    },
    alternates: {
      canonical: `https://www.cadivity.com/courses/${slug}`,
    },
  };
}

/* ─── Page Component (Server Component) ─── */
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  /* ── Visibility check ──
     getSession() never throws — returns null for unauthenticated guests */
  const session = await getSession();
  const role = session ? getUserRole(session.user) : null;
  const isAdmin = role === ROLES.ADMIN;

  if (course.status !== "published" && !isAdmin) {
    notFound();
  }

  /* ── Enrollment check — only if logged in ── */
  let isEnrolled = false;
  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
      select: { id: true },
    });
    isEnrolled = !!enrollment;
  }

  /* ── Instructor profile ── */
  const instructorProfile = course.instructor?.id
    ? await prisma.instructorProfile.findUnique({
        where: { userId: course.instructor.id },
        select: { bio: true, headline: true, website: true, linkedinUrl: true, expertise: true },
      })
    : null;

  const enrolledStudents = (course as any)._count?.enrollments ?? 0;

  /* ── Total content duration ── */
  const totalDurationSecs = course.sections.reduce(
    (sum, s) => sum + s.lessons.reduce((ls, l) => ls + (l.duration ?? 0), 0),
    0
  );
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  /* ── Prepare clean data for client component ── */
  const courseData = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    shortDescription: course.shortDescription,
    logo: course.logo,
    difficultyBadge: course.difficultyBadge,
    tags: course.tags,
    keyFeatures: course.keyFeatures,
    ctaType: course.ctaType,
    brochureUrl: course.brochureUrl,
    price: course.price,
    originalPrice: course.originalPrice,
    whatYouWillLearn: course.whatYouWillLearn,
    requirements: course.requirements,
    whoIsThisFor: course.whoIsThisFor,
    instructor: course.instructor,
    category: course.category,
    sections: course.sections.map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        duration: l.duration,
        order: l.order,
        isPreviewable: l.isPreviewable,
      })),
    })),
    enrolledStudents,
    sectionCount: course.sections.length,
    totalLessons,
    isEnrolled,
    faq: (course as any).faq as Array<{ question: string; answer: string }> | null,
    instructorProfile,
    currentUserId: session?.user?.id ?? null,
  };

  /* ── JSON-LD structured data ── */
  const courseWorkload =
    totalDurationSecs > 0
      ? `PT${Math.floor(totalDurationSecs / 3600)}H${Math.floor((totalDurationSecs % 3600) / 60)}M`
      : undefined;

  const educationalLevelMap: Record<string, string> = {
    "Beginner/Inter": "Beginner",
    Intermediate: "Intermediate",
    Advanced: "Advanced",
    Expert: "Expert",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description:
      course.seoDescription ??
      course.shortDescription ??
      `Learn ${course.title} with hands-on CAD automation training at Cadivity.`,
    url: `https://www.cadivity.com/courses/${slug}`,
    provider: {
      "@type": "Organization",
      name: "Cadivity",
      sameAs: "https://www.cadivity.com",
    },
    ...(course.difficultyBadge && {
      educationalLevel:
        educationalLevelMap[course.difficultyBadge] ?? course.difficultyBadge,
    }),
    ...(courseWorkload && {
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en",
        courseWorkload,
      },
    }),
    ...(course.price != null && {
      offers: {
        "@type": "Offer",
        price: course.price.toString(),
        priceCurrency: "INR",
        availability:
          course.ctaType === "coming_soon"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/InStock",
      },
    }),
    ...(course.instructor && {
      instructor: {
        "@type": "Person",
        name: course.instructor.name,
      },
    }),
  };

  /* ── Breadcrumb JSON-LD ── */
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.cadivity.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Courses",
        item: "https://www.cadivity.com/courses",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: course.title,
        item: `https://www.cadivity.com/courses/${slug}`,
      },
    ],
  };

  /* ── FAQ JSON-LD ── */
  const faqItems = (course as any).faq as Array<{ question: string; answer: string }> | null;
  const faqLd = faqItems && faqItems.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <CourseDetailClient course={courseData} />
      <RelatedCourses slug={slug} />
    </>
  );
}
