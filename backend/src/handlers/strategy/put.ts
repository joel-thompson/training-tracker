import type { Context } from "hono";
import { sql } from "drizzle-orm";
import { upsertGameStrategySchema } from "shared/validation";
import { db } from "../../db";
import { gameStrategies } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import {
  ErrorCodes,
  errorResponse,
  successResponse,
} from "../../utils/response";
import { toGameStrategyResponse } from "../../utils/transforms";

export const upsertGameStrategyHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const body: unknown = await c.req.json();
  const parsed = upsertGameStrategySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400,
    );
  }

  const [strategy] = await db
    .insert(gameStrategies)
    .values({
      userId,
      markdown: parsed.data.markdown,
    })
    .onConflictDoUpdate({
      target: gameStrategies.userId,
      set: {
        markdown: parsed.data.markdown,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  const responseData = toGameStrategyResponse(strategy);

  return c.json(successResponse(responseData));
};
