import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions, sessionItems } from "../../db/schema";
import { createItemSchema, updateItemSchema } from "shared/validation";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { SessionItem, DeleteItemResponse } from "shared/types";
import { eq, and, isNull, max } from "drizzle-orm";

async function verifySessionOwnership(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const [session] = await db
    .select({ id: trainingSessions.id })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.id, sessionId),
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt)
      )
    )
    .limit(1);
  return !!session;
}

export const addSessionItemHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const sessionId = c.req.param("id");
  const body: unknown = await c.req.json();
  const parsed = createItemSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const ownsSession = await verifySessionOwnership(sessionId, userId);
  if (!ownsSession) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Session not found"),
      404
    );
  }

  // Get the next order number for this item type
  const [maxOrderResult] = await db
    .select({ maxOrder: max(sessionItems.order) })
    .from(sessionItems)
    .where(
      and(
        eq(sessionItems.sessionId, sessionId),
        eq(sessionItems.type, parsed.data.type)
      )
    );

  const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

  const [item] = await db
    .insert(sessionItems)
    .values({
      sessionId,
      type: parsed.data.type,
      content: parsed.data.content,
      order: nextOrder,
    })
    .returning();

  // Update session's updatedAt
  await db
    .update(trainingSessions)
    .set({ updatedAt: new Date() })
    .where(eq(trainingSessions.id, sessionId));

  const responseData: SessionItem = {
    id: item.id,
    sessionId: item.sessionId,
    type: item.type,
    content: item.content,
    order: item.order,
    createdAt: item.createdAt.toISOString(),
  };

  return c.json(successResponse(responseData), 201);
};

export const updateSessionItemHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const sessionId = c.req.param("id");
  const itemId = c.req.param("itemId");
  const body: unknown = await c.req.json();
  const parsed = updateItemSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const ownsSession = await verifySessionOwnership(sessionId, userId);
  if (!ownsSession) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Session not found"),
      404
    );
  }

  // Check item exists and belongs to this session
  const [existing] = await db
    .select()
    .from(sessionItems)
    .where(
      and(eq(sessionItems.id, itemId), eq(sessionItems.sessionId, sessionId))
    )
    .limit(1);

  if (!existing) {
    return c.json(errorResponse(ErrorCodes.NOT_FOUND, "Item not found"), 404);
  }

  const [updated] = await db
    .update(sessionItems)
    .set({ content: parsed.data.content })
    .where(eq(sessionItems.id, itemId))
    .returning();

  // Update session's updatedAt
  await db
    .update(trainingSessions)
    .set({ updatedAt: new Date() })
    .where(eq(trainingSessions.id, sessionId));

  const responseData: SessionItem = {
    id: updated.id,
    sessionId: updated.sessionId,
    type: updated.type,
    content: updated.content,
    order: updated.order,
    createdAt: updated.createdAt.toISOString(),
  };

  return c.json(successResponse(responseData));
};

export const deleteSessionItemHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const sessionId = c.req.param("id");
  const itemId = c.req.param("itemId");

  const ownsSession = await verifySessionOwnership(sessionId, userId);
  if (!ownsSession) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Session not found"),
      404
    );
  }

  // Check item exists and belongs to this session
  const [existing] = await db
    .select()
    .from(sessionItems)
    .where(
      and(eq(sessionItems.id, itemId), eq(sessionItems.sessionId, sessionId))
    )
    .limit(1);

  if (!existing) {
    return c.json(errorResponse(ErrorCodes.NOT_FOUND, "Item not found"), 404);
  }

  await db.delete(sessionItems).where(eq(sessionItems.id, itemId));

  // Update session's updatedAt
  await db
    .update(trainingSessions)
    .set({ updatedAt: new Date() })
    .where(eq(trainingSessions.id, sessionId));

  const responseData: DeleteItemResponse = {
    id: itemId,
    deleted: true,
  };

  return c.json(successResponse(responseData));
};
