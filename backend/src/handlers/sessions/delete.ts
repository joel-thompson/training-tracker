import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { DeleteSessionResponse } from "shared/types";
import { eq, and, isNull } from "drizzle-orm";

export const deleteSessionHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const sessionId = c.req.param("id");

  // Check session exists and belongs to user
  const [existing] = await db
    .select()
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.id, sessionId),
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Session not found"),
      404
    );
  }

  const deletedAt = new Date();
  await db
    .update(trainingSessions)
    .set({ deletedAt })
    .where(eq(trainingSessions.id, sessionId));

  const responseData: DeleteSessionResponse = {
    id: sessionId,
    deletedAt: deletedAt.toISOString(),
  };

  return c.json(successResponse(responseData));
};
