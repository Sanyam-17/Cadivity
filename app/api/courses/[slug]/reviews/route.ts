import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getSession } from "@/lib/server/auth-guard";
import { getUserRole } from "@/lib/roles";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});

/* ── GET /api/courses/[slug]/reviews  ── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const [reviews, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: { courseId: course.id, isPublished: true },
      include: {
        student: { select: { id: true, name: true, image: true } },
      },
      orderBy: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
    prisma.review.aggregate({
      where: { courseId: course.id, isPublished: true },
      _avg: { rating: true },
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    reviews,
    avgRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count.id,
  });
}

/* ── POST /api/courses/[slug]/reviews  ── */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Login required to leave a review" }, { status: 401 });
  }

  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  /* only enrolled students can review */
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.user.id, courseId: course.id } },
    select: { id: true },
  });
  if (!enrollment) {
    return NextResponse.json(
      { error: "You must be enrolled in this course to leave a review" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: { studentId_courseId: { studentId: session.user.id, courseId: course.id } },
    create: {
      courseId: course.id,
      studentId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      body: parsed.data.body ?? null,
    },
    update: {
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      body: parsed.data.body ?? null,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
