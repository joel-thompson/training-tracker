import type { z } from "zod";
import type {
  classTypeSchema,
  itemTypeSchema,
  createSessionSchema,
  updateSessionSchema,
  createItemSchema,
  updateItemSchema,
} from "../validation/sessions";
import type { PaginationInfo } from "./api";

// Enum types inferred from Zod schemas
export type ClassType = z.infer<typeof classTypeSchema>;
export type ItemType = z.infer<typeof itemTypeSchema>;

// Input types inferred from Zod schemas
// Used by frontend forms and backend validation
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// Session item as it appears in API responses
export interface SessionItem {
  id: string;
  sessionId: string;
  type: ItemType;
  content: string;
  order: number;
  createdAt: string;
}

// Session as it appears in API responses
// Used by: GET /sessions/:id, POST /sessions, PATCH /sessions/:id
export interface Session {
  id: string;
  userId: string;
  sessionDate: string;
  classType: ClassType;
  techniqueCovered: string | null;
  generalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  items?: SessionItem[];
}

// GET /sessions - List sessions with pagination
export interface ListSessionsResponse {
  sessions: Session[];
  pagination: PaginationInfo;
}

// GET /sessions/dates - Get all training dates
export interface SessionDatesResponse {
  dates: string[];
}

// DELETE /sessions/:id - Soft delete a session
export interface DeleteSessionResponse {
  id: string;
  deletedAt: string;
}

// POST /sessions/:id/restore - Restore a deleted session
export interface RestoreSessionResponse {
  id: string;
  deletedAt: null;
  updatedAt: string;
}

// DELETE /sessions/:id/items/:itemId - Delete a session item
export interface DeleteItemResponse {
  id: string;
  deleted: true;
}
