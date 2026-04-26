import type { Context } from "hono";
import { eq } from "drizzle-orm";
import type { GetGameStrategyResponse } from "shared/types";
import { db } from "../../db";
import { gameStrategies } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import { successResponse } from "../../utils/response";
import { toGameStrategyResponse } from "../../utils/transforms";

export const getGameStrategyHandler = async (c: Context) => {
  const userId = requireUserId(c);

  const [strategy] = await db
    .select()
    .from(gameStrategies)
    .where(eq(gameStrategies.userId, userId))
    .limit(1);

  const responseData: GetGameStrategyResponse = {
    strategy: strategy ? toGameStrategyResponse(strategy) : null,
  };

  return c.json(successResponse(responseData));
};
