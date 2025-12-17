import type { Context } from "hono";
import { db } from "../../../db";
import { gameItems } from "../../../db/schema";
import { updateGameItemSchema } from "shared/validation";
import { requireUserId } from "../../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../../utils/response";
import type { GameItem } from "shared/types";
import { eq, and, sql } from "drizzle-orm";

export const updateGameItemHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const itemId = c.req.param("id");
  const body: unknown = await c.req.json();
  const parsed = updateGameItemSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const [existing] = await db
    .select()
    .from(gameItems)
    .where(and(eq(gameItems.id, itemId), eq(gameItems.userId, userId)))
    .limit(1);

  if (!existing) {
    return c.json(errorResponse(ErrorCodes.NOT_FOUND, "Item not found"), 404);
  }

  if (parsed.data.parentId !== undefined && parsed.data.parentId !== null) {
    const [parent] = await db
      .select()
      .from(gameItems)
      .where(
        and(
          eq(gameItems.id, parsed.data.parentId),
          eq(gameItems.userId, userId)
        )
      )
      .limit(1);

    if (!parent) {
      return c.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Parent item not found"),
        404
      );
    }

    if (parsed.data.parentId === itemId) {
      return c.json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          "Item cannot be its own parent"
        ),
        400
      );
    }
  }

  const updateData: Record<string, unknown> = {
    updatedAt: sql`now()`,
  };

  if (parsed.data.name !== undefined) {
    updateData.name = parsed.data.name;
  }
  if (parsed.data.notes !== undefined) {
    updateData.notes = parsed.data.notes;
  }
  if (parsed.data.parentId !== undefined) {
    updateData.parentId = parsed.data.parentId;
  }
  if (parsed.data.displayOrder !== undefined) {
    updateData.displayOrder = parsed.data.displayOrder;
  }

  const [updated] = await db
    .update(gameItems)
    .set(updateData)
    .where(eq(gameItems.id, itemId))
    .returning();

  const responseData: GameItem = {
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    notes: updated.notes,
    parentId: updated.parentId,
    displayOrder: updated.displayOrder,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };

  return c.json(successResponse(responseData));
};
