import { z } from "zod";

export const classTypeSchema = z.enum(["gi", "nogi"]);

export const itemTypeSchema = z.enum(["success", "problem", "question"]);

const sessionItemsSchema = z
  .object({
    success: z.array(z.string().min(1).max(1000)).optional(),
    problem: z.array(z.string().min(1).max(1000)).optional(),
    question: z.array(z.string().min(1).max(1000)).optional(),
  })
  .optional();

export const createSessionSchema = z.object({
  sessionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),
  classType: classTypeSchema,
  techniqueCovered: z.string().max(1000).optional().nullable(),
  generalNotes: z.string().max(5000).optional().nullable(),
  items: sessionItemsSchema,
});

export const updateSessionSchema = z.object({
  sessionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
    .optional(),
  classType: classTypeSchema.optional(),
  techniqueCovered: z.string().max(1000).optional().nullable(),
  generalNotes: z.string().max(5000).optional().nullable(),
});

export const listSessionsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  cursor: z.uuid().optional(),
  classType: classTypeSchema.optional(),
  weekStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  excludeItems: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional()
    .default(false),
});

export const createItemSchema = z.object({
  type: itemTypeSchema,
  content: z.string().min(1).max(1000),
});

export const updateItemSchema = z.object({
  content: z.string().min(1).max(1000),
});
