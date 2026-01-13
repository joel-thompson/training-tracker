import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(10000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
});
