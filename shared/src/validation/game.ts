import { z } from "zod";

export const createGameItemSchema = z.object({
  name: z.string().min(1).max(200),
  notes: z.string().max(5000).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  displayOrder: z.number().int().optional().default(0),
});

export const updateGameItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  notes: z.string().max(5000).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  displayOrder: z.number().int().optional(),
});

export const createGameTransitionSchema = z.object({
  fromItemId: z.string().uuid(),
  toItemId: z.string().uuid(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateGameTransitionSchema = z.object({
  notes: z.string().max(1000).optional().nullable(),
});
