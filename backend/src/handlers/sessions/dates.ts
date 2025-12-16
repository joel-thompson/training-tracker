import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import { successResponse } from "../../utils/response";
import type { SessionDatesResponse } from "shared/types";
import { eq, and, isNull, desc } from "drizzle-orm";

export const getSessionDatesHandler = async (c: Context) => {
  const userId = requireUserId(c);

  const sessions = await db
    .selectDistinct({ sessionDate: trainingSessions.sessionDate })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt)
      )
    )
    .orderBy(desc(trainingSessions.sessionDate));

  const responseData: SessionDatesResponse = {
    dates: sessions.map((s) => s.sessionDate),
  };

  return c.json(successResponse(responseData));
};
