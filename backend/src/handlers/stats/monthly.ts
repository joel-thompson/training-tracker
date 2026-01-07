import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import { successResponse } from "../../utils/response";
import type { MonthlySessionsResponse } from "shared/types";
import { eq, and, isNull, sql, gte, lt } from "drizzle-orm";

export const getMonthlySessionsHandler = async (c: Context) => {
  const userId = requireUserId(c);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // First day of current month
  const firstDayThisMonth = new Date(currentYear, currentMonth, 1);
  const firstDayThisMonthStr = firstDayThisMonth.toISOString().split("T")[0];

  // First day of next month
  const firstDayNextMonth = new Date(currentYear, currentMonth + 1, 1);
  const firstDayNextMonthStr = firstDayNextMonth.toISOString().split("T")[0];

  // First day of last month
  const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const firstDayLastMonthStr = firstDayLastMonth.toISOString().split("T")[0];

  // Count sessions this month
  const thisMonthResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt),
        gte(trainingSessions.sessionDate, firstDayThisMonthStr),
        lt(trainingSessions.sessionDate, firstDayNextMonthStr)
      )
    );

  // Count sessions last month
  const lastMonthResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt),
        gte(trainingSessions.sessionDate, firstDayLastMonthStr),
        lt(trainingSessions.sessionDate, firstDayThisMonthStr)
      )
    );

  const responseData: MonthlySessionsResponse = {
    thisMonth: thisMonthResult[0]?.count ?? 0,
    lastMonth: lastMonthResult[0]?.count ?? 0,
  };

  return c.json(successResponse(responseData));
};

