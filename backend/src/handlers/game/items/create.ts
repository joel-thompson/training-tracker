import type { Context } from "hono";
import { db } from "../../../db";
import { gameItems } from "../../../db/schema";
import { createGameItemSchema } from "shared/validation";
import { requireUserId } from "../../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../../utils/response";
import type { GameItem } from "shared/types";
import { eq, and } from "drizzle-orm";

export const createGameItemHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const body: unknown = await c.req.json();
  const parsed = createGameItemSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  if (parsed.data.parentId) {
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
  }

  const [item] = await db
    .insert(gameItems)
    .values({
      userId,
      name: parsed.data.name,
      notes: parsed.data.notes ?? null,
      parentId: parsed.data.parentId ?? null,
      displayOrder: parsed.data.displayOrder ?? 0,
    })
    .returning();

  const responseData: GameItem = {
    id: item.id,
    userId: item.userId,
    name: item.name,
    notes: item.notes,
    parentId: item.parentId,
    displayOrder: item.displayOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };

  return c.json(successResponse(responseData), 201);
};
