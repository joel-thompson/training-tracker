import type { Context } from "hono";
import { db } from "../../../db";
import { gameItems } from "../../../db/schema";
import { requireUserId } from "../../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../../utils/response";
import type { DeleteGameItemResponse } from "shared/types";
import { eq, and } from "drizzle-orm";

export const deleteGameItemHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const itemId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(gameItems)
    .where(and(eq(gameItems.id, itemId), eq(gameItems.userId, userId)))
    .limit(1);

  if (!existing) {
    return c.json(errorResponse(ErrorCodes.NOT_FOUND, "Item not found"), 404);
  }

  await db.delete(gameItems).where(eq(gameItems.id, itemId));

  const responseData: DeleteGameItemResponse = {
    id: itemId,
    deleted: true,
  };

  return c.json(successResponse(responseData));
};
