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

export const getGoalHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const goalId = c.req.param("id");

  const [goal] = await db
    .select()
    .from(trainingGoals)
    .where(and(eq(trainingGoals.id, goalId), eq(trainingGoals.userId, userId)))
    .limit(1);

  if (!goal) {
    return c.json(errorResponse(ErrorCodes.NOT_FOUND, "Goal not found"), 404);
  }

  const responseData: Goal = {
    id: goal.id,
    userId: goal.userId,
    goalText: goal.goalText,
    isActive: goal.isActive,
    createdAt: goal.createdAt.toISOString(),
    completedAt: goal.completedAt?.toISOString() ?? null,
  };

  return c.json(successResponse(responseData));
};
