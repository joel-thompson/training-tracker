import type { Context } from "hono";
import { db } from "../../db";
import { trainingGoals } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { Goal } from "shared/types";
import { eq, and } from "drizzle-orm";

export const reactivateGoalHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const goalId = c.req.param("id");

  // Check goal exists and belongs to user
  const [existing] = await db
    .select()
    .from(trainingGoals)
    .where(and(eq(trainingGoals.id, goalId), eq(trainingGoals.userId, userId)))
    .limit(1);

  if (!existing) {
    return c.json(errorResponse(ErrorCodes.NOT_FOUND, "Goal not found"), 404);
  }

  const [updated] = await db
    .update(trainingGoals)
    .set({ isActive: true, completedAt: null })
    .where(eq(trainingGoals.id, goalId))
    .returning();

  const responseData: Goal = {
    id: updated.id,
    userId: updated.userId,
    goalText: updated.goalText,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() ?? null,
  };

  return c.json(successResponse(responseData));
};
