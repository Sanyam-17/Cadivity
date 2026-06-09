import { z } from "zod";

export const idSchema = z.string().trim().min(1).max(191);

export const createSectionSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    courseId: idSchema,
  })
  .strict();

export const updateSectionSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
  })
  .strict();

export const createLessonSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    sectionId: idSchema,
    type: z.enum(["video", "text", "quiz"]).optional(),
    content: z.unknown().optional(),
    duration: z.coerce.number().int().min(0).max(86_400).nullable().optional(),
    youtubeVideoId: z.string().trim().max(100).nullable().optional(),
  })
  .strict();

export const reorderCurriculumSchema = z
  .object({
    sections: z.array(
      z
        .object({
          id: idSchema,
          order: z.number().int().min(0),
          lessons: z
            .array(
              z.object({
                id: idSchema,
                order: z.number().int().min(0),
              })
            )
            .optional(),
        })
        .strict()
    ),
  })
  .strict();
