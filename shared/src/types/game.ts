import type { z } from "zod";
import type {
  createGameItemSchema,
  updateGameItemSchema,
  createGameTransitionSchema,
  updateGameTransitionSchema,
  reorderGameItemSchema,
} from "../validation/game";

// Input types inferred from Zod schemas
export type CreateGameItemInput = z.infer<typeof createGameItemSchema>;
export type UpdateGameItemInput = z.infer<typeof updateGameItemSchema>;
export type CreateGameTransitionInput = z.infer<
  typeof createGameTransitionSchema
>;
export type UpdateGameTransitionInput = z.infer<
  typeof updateGameTransitionSchema
>;
export type ReorderGameItemInput = z.infer<typeof reorderGameItemSchema>;

// GameItem as it appears in API responses
export interface GameItem {
  id: string;
  userId: string;
  name: string;
  notes: string | null;
  parentId: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: GameItem[];
}

// GameTransition as it appears in API responses
export interface GameTransition {
  id: string;
  userId: string;
  fromItemId: string;
  toItemId: string;
  notes: string | null;
  createdAt: string;
  fromItem?: GameItem;
  toItem?: GameItem;
}

// GET /game/items - List all items as tree
export interface ListGameItemsResponse {
  items: GameItem[];
}

// GET /game/transitions - List all transitions
export interface ListGameTransitionsResponse {
  transitions: GameTransition[];
}

// DELETE /game/items/:id - Delete an item
export interface DeleteGameItemResponse {
  id: string;
  deleted: true;
}

// DELETE /game/transitions/:id - Delete a transition
export interface DeleteGameTransitionResponse {
  id: string;
  deleted: true;
}
