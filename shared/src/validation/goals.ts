import { z } from "zod";

export const createGoalSchema = z.object({
  goalText: z.string().min(1).max(500),
  isActive: z.boolean().optional().default(true),
});

export const updateGoalSchema = z.object({
  goalText: z.string().min(1).max(500),
});

export const listGoalsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  cursor: z.uuid().optional(),
  active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});
