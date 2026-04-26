import type { Context } from "hono";
import { eq } from "drizzle-orm";
import type { DeleteGameStrategyResponse } from "shared/types";
import { db } from "../../db";
import { gameStrategies } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import {
  ErrorCodes,
  errorResponse,
  successResponse,
} from "../../utils/response";

export const deleteGameStrategyHandler = async (c: Context) => {
  const userId = requireUserId(c);

  const [existing] = await db
    .select()
    .from(gameStrategies)
    .where(eq(gameStrategies.userId, userId))
    .limit(1);

  if (!existing) {
    return c.json(
      errorResponse(ErrorCodes.NOT_FOUND, "Strategy not found"),
      404,
    );
  }

  await db.delete(gameStrategies).where(eq(gameStrategies.userId, userId));

  const responseData: DeleteGameStrategyResponse = {
    deleted: true,
  };

  return c.json(successResponse(responseData));
};
