import { z } from "zod";
import { ROLES } from "@/lib/roles";

export const adminUserRolePatchSchema = z
  .object({
    userId: z.string().trim().min(1).max(191),
    role: z.enum([ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT]),
  })
  .strict();

export const instructorLessonCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    type: z.enum(["video", "text", "quiz"]),
  })
  .strict();
