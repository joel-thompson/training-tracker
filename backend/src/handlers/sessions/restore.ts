import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { RestoreSessionResponse } from "shared/types";
import { eq, and, isNotNull } from "drizzle-orm";

export const restoreSessionHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const sessionId = c.req.param("id");

  // Check session exists, belongs to user, and is deleted
  const [existing] = await db
    .select()
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.id, sessionId),
        eq(trainingSessions.userId, userId),
        isNotNull(trainingSessions.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Session not found"),
      404
    );
  }

  const updatedAt = new Date();
  await db
    .update(trainingSessions)
    .set({ deletedAt: null, updatedAt })
    .where(eq(trainingSessions.id, sessionId));

  const responseData: RestoreSessionResponse = {
    id: sessionId,
    deletedAt: null,
    updatedAt: updatedAt.toISOString(),
  };

  return c.json(successResponse(responseData));
};
