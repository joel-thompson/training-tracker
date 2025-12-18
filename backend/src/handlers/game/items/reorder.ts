import type { Context } from "hono";
import { db } from "../../../db";
import { gameItems } from "../../../db/schema";
import { reorderGameItemSchema } from "shared/validation";
import { requireUserId } from "../../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../../utils/response";
import type { GameItem } from "shared/types";
import { eq, and, sql, isNull, asc } from "drizzle-orm";

export const reorderGameItemHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const itemId = c.req.param("id");
  const body: unknown = await c.req.json();
  const parsed = reorderGameItemSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const { direction } = parsed.data;

  const [item] = await db
    .select()
    .from(gameItems)
    .where(and(eq(gameItems.id, itemId), eq(gameItems.userId, userId)))
    .limit(1);

  if (!item) {
    return c.json(errorResponse(ErrorCodes.NOT_FOUND, "Item not found"), 404);
  }

  // Fetch all siblings (items with the same parentId)
  const siblings = await db
    .select()
    .from(gameItems)
    .where(
      and(
        eq(gameItems.userId, userId),
        item.parentId
          ? eq(gameItems.parentId, item.parentId)
          : isNull(gameItems.parentId)
      )
    )
    .orderBy(asc(gameItems.displayOrder), asc(gameItems.createdAt));

  // Sort siblings by displayOrder (fallback to createdAt for ties)
  const sortedSiblings = [...siblings].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const currentIndex = sortedSiblings.findIndex((s) => s.id === itemId);

  if (currentIndex === -1) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Item not found in siblings"),
      404
    );
  }

  // Check if move is possible
  if (direction === "up" && currentIndex === 0) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, "Item is already at the top"),
      400
    );
  }

  if (direction === "down" && currentIndex === sortedSiblings.length - 1) {
    return c.json(
      errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "Item is already at the bottom"
      ),
      400
    );
  }

  // Swap items in the array
  const newOrder = [...sortedSiblings];
  if (direction === "up") {
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [
      newOrder[currentIndex],
      newOrder[currentIndex - 1],
    ];
  } else {
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
      newOrder[currentIndex + 1],
      newOrder[currentIndex],
    ];
  }

  // Update all affected items' displayOrder values
  // Use a transaction to ensure atomicity
  await db.transaction(async (tx) => {
    for (let i = 0; i < newOrder.length; i++) {
      const sibling = newOrder[i];
      if (sibling.displayOrder !== i) {
        await tx
          .update(gameItems)
          .set({
            displayOrder: i,
            updatedAt: sql`now()`,
          })
          .where(eq(gameItems.id, sibling.id));
      }
    }
  });

  // Fetch the updated item
  const [updated] = await db
    .select()
    .from(gameItems)
    .where(eq(gameItems.id, itemId))
    .limit(1);

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
