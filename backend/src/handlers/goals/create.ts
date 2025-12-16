import type { Context } from "hono";
import { db } from "../../db";
import { trainingGoals } from "../../db/schema";
import { createGoalSchema } from "shared/validation";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { Goal } from "shared/types";

export const createGoalHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const body: unknown = await c.req.json();
  const parsed = createGoalSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const { goalText, isActive } = parsed.data;

  const [goal] = await db
    .insert(trainingGoals)
    .values({
      userId,
      goalText,
      isActive: isActive ?? true,
    })
    .returning();

  const responseData: Goal = {
    id: goal.id,
    userId: goal.userId,
    goalText: goal.goalText,
    isActive: goal.isActive,
    createdAt: goal.createdAt.toISOString(),
    completedAt: goal.completedAt?.toISOString() ?? null,
  };

  return c.json(successResponse(responseData), 201);
};
