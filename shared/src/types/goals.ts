import type { z } from "zod";
import type {
  createGoalSchema,
  updateGoalSchema,
  listGoalsQuerySchema,
} from "../validation/goals";
import type { PaginationInfo } from "./api";

// Input types inferred from Zod schemas
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type ListGoalsQuery = z.infer<typeof listGoalsQuerySchema>;

// Goal category type
export type GoalCategory = "bottom" | "top" | "submission" | "escape";

// Goal as it appears in API responses
export interface Goal {
  id: string;
  userId: string;
  goalText: string;
  category: GoalCategory | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  completedAt: string | null;
}

// GET /goals - List goals with pagination
export interface ListGoalsResponse {
  goals: Goal[];
  pagination: PaginationInfo;
}

// GET /goals/active - Get all active goals
export interface ActiveGoalsResponse {
  goals: Goal[];
}

// DELETE /goals/:id - Delete a goal
export interface DeleteGoalResponse {
  id: string;
  deleted: true;
}
