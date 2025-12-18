import type { Context } from "hono";
import { db } from "../../../db";
import { gameTransitions } from "../../../db/schema";
import { requireUserId } from "../../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../../utils/response";
import type { DeleteGameTransitionResponse } from "shared/types";
import { eq, and } from "drizzle-orm";

export const deleteGameTransitionHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const transitionId = c.req.param("id");

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

  await db.delete(gameTransitions).where(eq(gameTransitions.id, transitionId));

  const responseData: DeleteGameTransitionResponse = {
    id: transitionId,
    deleted: true,
  };

  return c.json(successResponse(responseData));
};
