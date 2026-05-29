import { z } from "zod";
import {
  videoContentSchema,
  textContentSchema,
  quizContentSchema,
  lessonContentSchema,
  quizQuestionSchema,
} from "./lesson.schema";

export type VideoContent = z.infer<typeof videoContentSchema>;
export type TextContent = z.infer<typeof textContentSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizContent = z.infer<typeof quizContentSchema>;
export type LessonContent = z.infer<typeof lessonContentSchema>;
