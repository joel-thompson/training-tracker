import type { Context } from "hono";
import { db } from "../../db";
import { trainingGoals } from "../../db/schema";
import { updateGoalSchema } from "shared/validation";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { Goal } from "shared/types";
import { eq, and } from "drizzle-orm";

export const updateGoalHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const goalId = c.req.param("id");
  const body: unknown = await c.req.json();
  const parsed = updateGoalSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

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
    .set({ goalText: parsed.data.goalText })
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
