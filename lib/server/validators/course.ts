import { z } from "zod";

export const courseStatusSchema = z.enum(["draft", "published", "archived"]);
export const courseVisibilitySchema = z.enum(["public", "private", "unlisted"]);
export const lessonTypeSchema = z.enum(["video", "text", "quiz"]);

export const createCourseSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(10000).optional().nullable(),
  shortDescription: z.string().trim().max(240).optional().nullable(),
  logo: z.string().trim().max(200000).optional().nullable(),
  difficultyBadge: z.string().trim().max(40).optional().nullable(),
  tags: z.string().trim().max(500).optional().nullable(),
  keyFeatures: z.array(z.string().trim().min(1).max(160)).max(12).optional(),
  ctaType: z.enum(["enroll_now", "coming_soon", "contact_us"]).optional(),
  brochureUrl: z.string().trim().max(200000).optional().nullable(),
  price: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
  originalPrice: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
  instructorId: z.string().trim().min(1).max(191).optional().nullable(),
  categoryId: z.string().trim().min(1).max(191).optional().nullable(),
  status: courseStatusSchema.optional(),
  whatYouWillLearn: z.array(z.string().trim().min(1).max(240)).max(30).optional(),
  requirements: z.array(z.string().trim().min(1).max(240)).max(30).optional(),
  whoIsThisFor: z.array(z.string().trim().min(1).max(240)).max(30).optional(),
}).strict();

export const updateCourseSchema = z.object({
  title: z.string().trim().min(3).max(180).optional(),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  shortDescription: z.string().trim().max(240).nullable().optional(),
  thumbnail: z.string().trim().max(200000).nullable().optional(),
  logo: z.string().trim().max(200000).nullable().optional(),
  difficultyBadge: z.string().trim().max(40).nullable().optional(),
  tags: z.string().trim().max(500).nullable().optional(),
  keyFeatures: z.array(z.string().trim().min(1).max(160)).max(12).optional(),
  ctaType: z.enum(["enroll_now", "coming_soon", "contact_us"]).optional(),
  brochureUrl: z.string().trim().max(200000).nullable().optional(),
  price: z.coerce.number().int().min(0).max(10_000_000).nullable().optional(),
  originalPrice: z.coerce.number().int().min(0).max(10_000_000).nullable().optional(),
  status: courseStatusSchema.optional(),
  visibility: courseVisibilitySchema.optional(),
  completionCriteria: z.enum(["all_videos", "all_quizzes", "manual"]).optional(),
  seoTitle: z.string().trim().max(180).nullable().optional(),
  seoDescription: z.string().trim().max(4000).nullable().optional(),
  instructorId: z.string().trim().max(191).nullable().optional(),
  categoryId: z.string().trim().max(191).nullable().optional(),
  whatYouWillLearn: z.array(z.string().trim().min(1).max(240)).max(30).optional(),
  requirements: z.array(z.string().trim().min(1).max(240)).max(30).optional(),
  whoIsThisFor: z.array(z.string().trim().min(1).max(240)).max(30).optional(),
}).strict();

export const lessonPatchSchema = z.object({
  title: z.string().trim().min(1).max(180).optional(),
  type: lessonTypeSchema.optional(),
  content: z.unknown().optional(),
  duration: z.coerce.number().int().min(0).max(86_400).nullable().optional(),
  youtubeVideoId: z.string().trim().max(100).nullable().optional(),
}).strict();
