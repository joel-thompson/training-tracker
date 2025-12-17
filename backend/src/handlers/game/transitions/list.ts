import type { Context } from "hono";
import { db } from "../../../db";
import { gameTransitions, gameItems } from "../../../db/schema";
import { requireUserId } from "../../../utils/auth";
import { successResponse } from "../../../utils/response";
import type { ListGameTransitionsResponse } from "shared/types";
import { eq, asc } from "drizzle-orm";

export const listGameTransitionsHandler = async (c: Context) => {
  const userId = requireUserId(c);

  const transitionsData = await db
    .select()
    .from(gameTransitions)
    .where(eq(gameTransitions.userId, userId))
    .orderBy(asc(gameTransitions.createdAt));

  const items = await db
    .select({
      id: gameItems.id,
      name: gameItems.name,
    })
    .from(gameItems)
    .where(eq(gameItems.userId, userId));

  const itemMap = new Map(items.map((item) => [item.id, item]));

  const responseData: ListGameTransitionsResponse = {
    transitions: transitionsData.map((transition) => {
      const fromItem = itemMap.get(transition.fromItemId);
      const toItem = itemMap.get(transition.toItemId);

      return {
        id: transition.id,
        userId: transition.userId,
        fromItemId: transition.fromItemId,
        toItemId: transition.toItemId,
        notes: transition.notes,
        createdAt: transition.createdAt.toISOString(),
        fromItem: fromItem
          ? {
              id: fromItem.id,
              userId: userId,
              name: fromItem.name,
              notes: null,
              parentId: null,
              displayOrder: 0,
              createdAt: "",
              updatedAt: "",
            }
          : undefined,
        toItem: toItem
          ? {
              id: toItem.id,
              userId: userId,
              name: toItem.name,
              notes: null,
              parentId: null,
              displayOrder: 0,
              createdAt: "",
              updatedAt: "",
            }
          : undefined,
      };
    }),
  };

  return c.json(successResponse(responseData));
};
