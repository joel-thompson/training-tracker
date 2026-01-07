import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import { successResponse } from "../../utils/response";
import type { ClassTypeSplitResponse } from "shared/types";
import { eq, and, isNull, sql } from "drizzle-orm";

export const getClassTypeSplitHandler = async (c: Context) => {
  const userId = requireUserId(c);

  const results = await db
    .select({
      classType: trainingSessions.classType,
      count: sql<number>`count(*)::int`,
    })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt)
      )
    )
    .groupBy(trainingSessions.classType);

  let gi = 0;
  let nogi = 0;

  for (const row of results) {
    if (row.classType === "gi") {
      gi = row.count;
    } else if (row.classType === "nogi") {
      nogi = row.count;
    }
  }

  const responseData: ClassTypeSplitResponse = {
    gi,
    nogi,
    total: gi + nogi,
  };

  return c.json(successResponse(responseData));
};

