import type { z } from "zod";
import type { chatMessageSchema, chatRequestSchema } from "../validation/coach";

// Message role for chat
export type ChatMessageRole = "user" | "assistant";

// Message format for API requests/responses
export type ChatMessage = z.infer<typeof chatMessageSchema>;

// POST /coach/chat - Request body
export type ChatRequest = z.infer<typeof chatRequestSchema>;
