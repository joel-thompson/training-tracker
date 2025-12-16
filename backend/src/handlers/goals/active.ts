import type { Context } from "hono";
import { db } from "../../db";
import { trainingGoals } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import { successResponse } from "../../utils/response";
import type { ActiveGoalsResponse } from "shared/types";
import { eq, and, desc } from "drizzle-orm";

export const getActiveGoalsHandler = async (c: Context) => {
  const userId = requireUserId(c);

  const goals = await db
    .select()
    .from(trainingGoals)
    .where(
      and(eq(trainingGoals.userId, userId), eq(trainingGoals.isActive, true))
    )
    .orderBy(desc(trainingGoals.createdAt));

  const responseData: ActiveGoalsResponse = {
    goals: goals.map((goal) => ({
      id: goal.id,
      userId: goal.userId,
      goalText: goal.goalText,
      isActive: goal.isActive,
      createdAt: goal.createdAt.toISOString(),
      completedAt: goal.completedAt?.toISOString() ?? null,
    })),
  };

  return c.json(successResponse(responseData));
};
