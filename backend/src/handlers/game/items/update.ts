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

  if (parsed.data.parentId != null) {
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

    // Check for circular reference: ensure new parent is not a descendant
    const allItems = await db
      .select()
      .from(gameItems)
      .where(eq(gameItems.userId, userId));

    function isDescendant(
      itemId: string,
      potentialParentId: string,
      items: typeof allItems
    ): boolean {
      const itemMap = new Map<string, (typeof allItems)[0]>();
      for (const item of items) {
        itemMap.set(item.id, item);
      }

      function traverse(currentId: string): boolean {
        const current = itemMap.get(currentId);
        if (!current?.parentId) {
          return false;
        }
        if (current.parentId === potentialParentId) {
          return true;
        }
        return traverse(current.parentId);
      }

      return traverse(itemId);
    }

    if (isDescendant(parsed.data.parentId, itemId, allItems)) {
      return c.json(
        errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          "Cannot move item into its own descendant"
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
