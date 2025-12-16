import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions, sessionItems } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { Session } from "shared/types";
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

  const responseData: Session = {
    id: session.id,
    userId: session.userId,
    sessionDate: session.sessionDate,
    classType: session.classType,
    techniqueCovered: session.techniqueCovered,
    generalNotes: session.generalNotes,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    items: items.map((item) => ({
      id: item.id,
      sessionId: item.sessionId,
      type: item.type,
      content: item.content,
      order: item.order,
      createdAt: item.createdAt.toISOString(),
    })),
  };

  return c.json(successResponse(responseData));
};
