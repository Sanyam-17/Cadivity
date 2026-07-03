import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

/* ── GET /api/courses/[slug]/related  ── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true, categoryId: true, tags: true },
  });

  if (!course) return NextResponse.json({ courses: [] });

  /* Find courses in the same category first, then fall back to any published */
  const related = await prisma.course.findMany({
    where: {
      id: { not: course.id },
      status: "published",
      deletedAt: null,
      ...(course.categoryId ? { categoryId: course.categoryId } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      logo: true,
      difficultyBadge: true,
      shortDescription: true,
      price: true,
      originalPrice: true,
      ctaType: true,
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return NextResponse.json({
    courses: related.map((c) => ({
      ...c,
      enrollmentCount: (c as any)._count?.enrollments ?? 0,
      instructorName: c.instructor?.name ?? null,
      _count: undefined,
      instructor: undefined,
    })),
  });
}
