import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { guardApiRole } from "@/lib/server/auth-guard";
import { z } from "zod";

const profileSchema = z.object({
  bio: z.string().max(1000).optional(),
  headline: z.string().max(120).optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  expertise: z.array(z.string().max(60)).max(10).optional(),
});

/* ── GET /api/instructor/profile ── */
export async function GET(_req: NextRequest) {
  const guarded = await guardApiRole("instructor");
  if (guarded.error) return guarded.error;

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: guarded.session.user.id },
  });

  return NextResponse.json({ profile });
}

/* ── PATCH /api/instructor/profile ── */
export async function PATCH(request: NextRequest) {
  const guarded = await guardApiRole("instructor");
  if (guarded.error) return guarded.error;

  const body = await request.json().catch(() => ({}));
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await prisma.instructorProfile.upsert({
    where: { userId: guarded.session.user.id },
    create: { userId: guarded.session.user.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ profile });
}
