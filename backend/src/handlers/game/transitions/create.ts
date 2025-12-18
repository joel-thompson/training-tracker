import type { Context } from "hono";
import { db } from "../../../db";
import { gameTransitions, gameItems } from "../../../db/schema";
import { createGameTransitionSchema } from "shared/validation";
import { requireUserId } from "../../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../../utils/response";
import type { GameTransition } from "shared/types";
import { eq, and } from "drizzle-orm";

export const createGameTransitionHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const body: unknown = await c.req.json();
  const parsed = createGameTransitionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const [fromItem] = await db
    .select()
    .from(gameItems)
    .where(
      and(
        eq(gameItems.id, parsed.data.fromItemId),
        eq(gameItems.userId, userId)
      )
    )
    .limit(1);

  if (!fromItem) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "From item not found"),
      404
    );
  }

  const [toItem] = await db
    .select()
    .from(gameItems)
    .where(
      and(eq(gameItems.id, parsed.data.toItemId), eq(gameItems.userId, userId))
    )
    .limit(1);

  if (!toItem) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "To item not found"),
      404
    );
  }

  const [existing] = await db
    .select()
    .from(gameTransitions)
    .where(
      and(
        eq(gameTransitions.userId, userId),
        eq(gameTransitions.fromItemId, parsed.data.fromItemId),
        eq(gameTransitions.toItemId, parsed.data.toItemId)
      )
    )
    .limit(1);

  if (existing) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, "Transition already exists"),
      400
    );
  }

  const [transition] = await db
    .insert(gameTransitions)
    .values({
      userId,
      fromItemId: parsed.data.fromItemId,
      toItemId: parsed.data.toItemId,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  const responseData: GameTransition = {
    id: transition.id,
    userId: transition.userId,
    fromItemId: transition.fromItemId,
    toItemId: transition.toItemId,
    notes: transition.notes,
    createdAt: transition.createdAt.toISOString(),
  };

  return c.json(successResponse(responseData), 201);
};
