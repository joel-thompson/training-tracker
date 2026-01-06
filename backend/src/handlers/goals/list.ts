import type { Context } from "hono";
import { db } from "../../db";
import { trainingGoals } from "../../db/schema";
import { listGoalsQuerySchema } from "shared/validation";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { ListGoalsResponse } from "shared/types";
import { eq, and, desc, sql, count } from "drizzle-orm";

export const listGoalsHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const query: unknown = c.req.query();
  const parsed = listGoalsQuerySchema.safeParse(query);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const { limit, cursor, active } = parsed.data;

  // Build where conditions
  const conditions = [eq(trainingGoals.userId, userId)];

  if (active !== undefined) {
    conditions.push(eq(trainingGoals.isActive, active));
  }

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(trainingGoals)
    .where(and(...conditions));
  const total = totalResult?.count ?? 0;

  // If cursor provided, add pagination condition
  if (cursor) {
    const cursorGoal = await db
      .select({
        createdAt: trainingGoals.createdAt,
      })
      .from(trainingGoals)
      .where(eq(trainingGoals.id, cursor))
      .limit(1);

    if (cursorGoal.length > 0) {
      const cursorData = cursorGoal[0];
      conditions.push(
        sql`(${trainingGoals.createdAt}, ${trainingGoals.id}) < (${cursorData.createdAt}, ${cursor})`
      );
    }
  }

  // Fetch goals with category-based sorting
  // Order: bottom, top, submission, escape, then null (uncategorized)
  const goals = await db
    .select()
    .from(trainingGoals)
    .where(and(...conditions))
    .orderBy(
      sql`CASE 
        WHEN ${trainingGoals.category} = 'bottom' THEN 1
        WHEN ${trainingGoals.category} = 'top' THEN 2
        WHEN ${trainingGoals.category} = 'submission' THEN 3
        WHEN ${trainingGoals.category} = 'escape' THEN 4
        ELSE 5
      END`,
      desc(trainingGoals.createdAt)
    )
    .limit(limit + 1);

  const hasMore = goals.length > limit;
  const resultGoals = hasMore ? goals.slice(0, limit) : goals;
  const nextCursor = hasMore
    ? resultGoals[resultGoals.length - 1]?.id ?? null
    : null;

  const responseData: ListGoalsResponse = {
    goals: resultGoals.map((goal) => ({
      id: goal.id,
      userId: goal.userId,
      goalText: goal.goalText,
      category: goal.category,
      notes: goal.notes,
      isActive: goal.isActive,
      createdAt: goal.createdAt.toISOString(),
      completedAt: goal.completedAt?.toISOString() ?? null,
    })),
    pagination: {
      nextCursor,
      hasMore,
      total,
    },
  };

  return c.json(successResponse(responseData));
};
