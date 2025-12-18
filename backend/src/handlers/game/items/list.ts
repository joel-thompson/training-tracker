import type { Context } from "hono";
import { db } from "../../../db";
import { gameItems } from "../../../db/schema";
import { requireUserId } from "../../../utils/auth";
import { successResponse } from "../../../utils/response";
import type { ListGameItemsResponse, GameItem } from "shared/types";
import { eq, asc } from "drizzle-orm";

type DbGameItem = typeof gameItems.$inferSelect;

function buildTree(items: DbGameItem[]): GameItem[] {
  const itemMap = new Map<string, GameItem>();
  const rootItems: GameItem[] = [];

  for (const item of items) {
    itemMap.set(item.id, {
      id: item.id,
      userId: item.userId,
      name: item.name,
      notes: item.notes,
      parentId: item.parentId,
      displayOrder: item.displayOrder,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      children: [],
    });
  }

  for (const item of items) {
    const gameItem = itemMap.get(item.id)!;
    if (item.parentId) {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(gameItem);
      }
    } else {
      rootItems.push(gameItem);
    }
  }

  function sortChildren(items: GameItem[]): void {
    items.sort((a, b) => a.displayOrder - b.displayOrder);
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        sortChildren(item.children);
      }
    }
  }

  sortChildren(rootItems);
  return rootItems;
}

export const listGameItemsHandler = async (c: Context) => {
  const userId = requireUserId(c);

  const items = await db
    .select()
    .from(gameItems)
    .where(eq(gameItems.userId, userId))
    .orderBy(asc(gameItems.displayOrder), asc(gameItems.createdAt));

  const tree = buildTree(items);

  const responseData: ListGameItemsResponse = {
    items: tree,
  };

  return c.json(successResponse(responseData));
};
