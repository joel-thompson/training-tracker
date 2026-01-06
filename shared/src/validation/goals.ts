import { z } from "zod";

export const createGoalSchema = z.object({
  goalText: z.string().min(1).max(500),
  category: z.enum(["bottom", "top", "submission", "escape"]).optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateGoalSchema = z.object({
  goalText: z.string().min(1).max(500),
  category: z.enum(["bottom", "top", "submission", "escape"]).optional(),
  notes: z.string().max(1000).optional(),
});

export const listGoalsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  cursor: z.uuid().optional(),
  active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});
