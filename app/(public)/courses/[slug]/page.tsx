import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/db";
import { requireApiSession } from "@/lib/server/auth-guard";
import { getUserRole, ROLES } from "@/lib/roles";
import CourseDetailClient from "@/components/courses/CourseDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";

/* ─── Shared data fetcher ─── */

async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
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

  return course;
}

/* ─── generateMetadata ─── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Course Not Found | Cadivity",
    };
  }

  const title = `${course.seoTitle ?? course.title} | Cadivity`;
  const description = course.seoDescription ?? course.shortDescription ?? course.title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://cadivity.com/courses/${slug}`,
      images: course.thumbnail
        ? [{ url: course.thumbnail, width: 1200, height: 630, alt: course.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cadivity" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: course.thumbnail ? [course.thumbnail] : ["/og-image.png"],
    },
    alternates: {
      canonical: `/courses/${slug}`,
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

  if (!course) {
    notFound();
  }

  // Check visibility
  const session = await requireApiSession();
  const role = session ? getUserRole(session.user) : null;
  const isAdmin = role === ROLES.ADMIN;

  if (course.status !== "published" && !isAdmin) {
    notFound();
  }

  // Check enrollment
  let isEnrolled = false;
  if (session?.user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  const enrolledStudents = (course as any)._count?.enrollments ?? 0;

  // Prepare data for client component
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
      })),
    })),
    enrolledStudents,
    sectionCount: course.sections.length,
    isEnrolled,
  };

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.seoDescription ?? course.shortDescription ?? course.title,
    provider: {
      "@type": "Organization",
      name: "Cadivity",
      sameAs: "https://cadivity.com",
    },
    ...(course.price != null && {
      offers: {
        "@type": "Offer",
        price: course.price.toString(),
        priceCurrency: "INR",
        availability: course.ctaType === "coming_soon"
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

  return (
    <>
      <JsonLd data={jsonLd} />
      <CourseDetailClient course={courseData} />
    </>
  );
}
