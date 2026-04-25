import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(10000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
});

export const sampleFeedbackRequestSchema = z.object({
  note: z.string().min(1).max(2000),
});

export const sampleFeedbackResponseSchema = z.object({
  summary: z.string().min(1),
  nextStep: z.string().min(1),
  drillIdeas: z.array(z.string().min(1)).min(1).max(5),
});
