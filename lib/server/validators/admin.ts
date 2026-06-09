import { z } from "zod";
import { idSchema } from "./common";

export const categoryCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
  })
  .strict();

export const categoryUpdateSchema = z
  .object({
    id: idSchema,
    name: z.string().trim().min(2).max(120),
  })
  .strict();

export const categoryDeleteSchema = z
  .object({
    id: idSchema,
  })
  .strict();
