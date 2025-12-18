import type { Context } from "hono";
import { db } from "../../../db";
import { gameTransitions } from "../../../db/schema";
import { updateGameTransitionSchema } from "shared/validation";
import { requireUserId } from "../../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../../utils/response";
import type { GameTransition } from "shared/types";
import { eq, and } from "drizzle-orm";

export const updateGameTransitionHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const transitionId = c.req.param("id");
  const body: unknown = await c.req.json();
  const parsed = updateGameTransitionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  // Check transition exists and belongs to user
  const [existing] = await db
    .select()
    .from(gameTransitions)
    .where(
      and(
        eq(gameTransitions.id, transitionId),
        eq(gameTransitions.userId, userId)
      )
    )
    .limit(1);

  if (!existing) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Transition not found"),
      404
    );
  }

  const updateData: Partial<typeof gameTransitions.$inferInsert> = {};
  if (parsed.data.notes !== undefined) {
    updateData.notes = parsed.data.notes;
  }

  const [updated] = await db
    .update(gameTransitions)
    .set(updateData)
    .where(eq(gameTransitions.id, transitionId))
    .returning();

  const responseData: GameTransition = {
    id: updated.id,
    userId: updated.userId,
    fromItemId: updated.fromItemId,
    toItemId: updated.toItemId,
    notes: updated.notes,
    createdAt: updated.createdAt.toISOString(),
  };

  return c.json(successResponse(responseData));
};
