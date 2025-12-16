import type { Context } from "hono";
import { db } from "../../db";
import { trainingGoals } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { DeleteGoalResponse } from "shared/types";
import { eq, and } from "drizzle-orm";

export const deleteGoalHandler = async (c: Context) => {
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

  await db.delete(trainingGoals).where(eq(trainingGoals.id, goalId));

  const responseData: DeleteGoalResponse = {
    id: goalId,
    deleted: true,
  };

  return c.json(successResponse(responseData));
};
