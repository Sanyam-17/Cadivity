import { z } from "zod";

export const videoContentSchema = z.object({
  videoUrl: z.string().url("Must be a valid URL").or(z.literal("")),
});

export const textContentSchema = z.object({
  text: z.string(),
});

export const quizQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).min(2, "At least two options are required"),
  correctOptionIndex: z.number().min(0),
});

export const quizContentSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1, "At least one question is required"),
});

export const lessonContentSchema = z.union([
  videoContentSchema,
  textContentSchema,
  quizContentSchema,
]);

export type VideoContent = z.infer<typeof videoContentSchema>;
export type TextContent = z.infer<typeof textContentSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizContent = z.infer<typeof quizContentSchema>;
export type LessonContent = z.infer<typeof lessonContentSchema>;
