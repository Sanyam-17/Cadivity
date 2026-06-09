import type { Metadata } from "next";
import { prisma } from "@/lib/server/db";
import type { PublicCourse } from "@/components/layout/public-course-card";
import {
  CoursesHeroClient,
  CoursesGridClient,
  CoursesComparisonClient,
} from "@/components/courses/CoursesClientShell";

export const metadata: Metadata = {
  title: "CAD Automation Training Programs | Cadivity",
  description:
    "Practical, industry-oriented CAD automation training. Master Creo Toolkit, SolidWorks API, NX Open, and more with real-world projects.",
  openGraph: {
    title: "CAD Automation Training Programs | Cadivity",
    description:
      "Practical, industry-oriented CAD automation training. Master Creo Toolkit, SolidWorks API, NX Open, and more with real-world projects.",
    url: "https://cadivity.com/courses",
  },
  alternates: {
    canonical: "/courses",
  },
};

async function getPublishedCourses(): Promise<PublicCourse[]> {
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
      },
      orderBy: { createdAt: "desc" },
    });
    return courses;
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
      <CoursesGridClient courses={courses} />
      <CoursesComparisonClient />
    </div>
  );
}
