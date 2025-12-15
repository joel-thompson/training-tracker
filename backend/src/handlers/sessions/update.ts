import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions, sessionItems } from "../../db/schema";
import { updateSessionSchema } from "shared/validation";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { Session } from "shared/types";
import { eq, and, isNull } from "drizzle-orm";

export const updateSessionHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const sessionId = c.req.param("id");
  const body: unknown = await c.req.json();
  const parsed = updateSessionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

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

  const updateData: Partial<typeof trainingSessions.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.data.sessionDate !== undefined) {
    updateData.sessionDate = parsed.data.sessionDate;
  }
  if (parsed.data.classType !== undefined) {
    updateData.classType = parsed.data.classType;
  }
  if (parsed.data.techniqueCovered !== undefined) {
    updateData.techniqueCovered = parsed.data.techniqueCovered;
  }
  if (parsed.data.generalNotes !== undefined) {
    updateData.generalNotes = parsed.data.generalNotes;
  }

  const [updated] = await db
    .update(trainingSessions)
    .set(updateData)
    .where(eq(trainingSessions.id, sessionId))
    .returning();

  const items = await db
    .select()
    .from(sessionItems)
    .where(eq(sessionItems.sessionId, sessionId))
    .orderBy(sessionItems.type, sessionItems.order);

  const responseData: Session = {
    id: updated.id,
    userId: updated.userId,
    sessionDate: updated.sessionDate,
    classType: updated.classType,
    techniqueCovered: updated.techniqueCovered,
    generalNotes: updated.generalNotes,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
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
