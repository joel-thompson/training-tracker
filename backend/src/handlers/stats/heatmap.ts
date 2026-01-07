import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import { successResponse } from "../../utils/response";
import type { HeatmapResponse } from "shared/types";
import { eq, and, isNull, sql, gte } from "drizzle-orm";

export const getHeatmapHandler = async (c: Context) => {
  const userId = requireUserId(c);

  // Get activity for last 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0];

  const results = await db
    .select({
      date: trainingSessions.sessionDate,
      count: sql<number>`count(*)::int`,
    })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt),
        gte(trainingSessions.sessionDate, oneYearAgoStr)
      )
    )
    .groupBy(trainingSessions.sessionDate)
    .orderBy(trainingSessions.sessionDate);

  const responseData: HeatmapResponse = {
    activity: results.map((r) => ({
      date: r.date,
      count: r.count,
    })),
  };

  return c.json(successResponse(responseData));
};

