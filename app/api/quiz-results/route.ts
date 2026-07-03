import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { guardApiRole } from "@/lib/server/auth-guard";
import { z } from "zod";

const quizResultSchema = z.object({
  lessonId: z.string().cuid(),
  score: z.number().int().min(0),
  totalQ: z.number().int().min(1),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int(),
      isCorrect: z.boolean(),
    })
  ),
});

/* ── POST /api/quiz-results ── */
export async function POST(request: NextRequest) {
  const guarded = await guardApiRole("student");
  if (guarded.error) return guarded.error;

  const body = await request.json().catch(() => ({}));
  const parsed = quizResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { lessonId, score, totalQ, answers } = parsed.data;
  const studentId = guarded.session.user.id;

  const result = await prisma.quizResult.create({
    data: { lessonId, studentId, score, totalQ, answers },
  });

  return NextResponse.json(result, { status: 201 });
}

/* ── GET /api/quiz-results?lessonId=xxx ── */
export async function GET(request: NextRequest) {
  const guarded = await guardApiRole("student");
  if (guarded.error) return guarded.error;

  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const results = await prisma.quizResult.findMany({
    where: { lessonId, studentId: guarded.session.user.id },
    orderBy: { completedAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ results });
}
