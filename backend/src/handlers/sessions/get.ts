import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions, sessionItems } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import { toSessionResponse } from "../../utils/transforms";
import { eq, and, isNull } from "drizzle-orm";

export const getSessionHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const sessionId = c.req.param("id");

  const [session] = await db
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

  if (!session) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Session not found"),
      404
    );
  }

  const items = await db
    .select()
    .from(sessionItems)
    .where(eq(sessionItems.sessionId, sessionId))
    .orderBy(sessionItems.type, sessionItems.order);

  const responseData = toSessionResponse(session, items);

  return c.json(successResponse(responseData));
};
