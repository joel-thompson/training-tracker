import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions } from "../../db/schema";
import { requireUserId } from "../../utils/auth";
import { successResponse } from "../../utils/response";
import type { StreakResponse } from "shared/types";
import { eq, and, isNull, sql } from "drizzle-orm";

export const getStreakHandler = async (c: Context) => {
  const userId = requireUserId(c);

  // Get distinct weeks (year-week combinations) with training sessions
  // Using ISO week format: YYYY-WW
  const weeks = await db
    .selectDistinct({
      yearWeek: sql<string>`TO_CHAR(${trainingSessions.sessionDate}, 'IYYY-IW')`,
    })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt)
      )
    )
    .orderBy(sql`TO_CHAR(${trainingSessions.sessionDate}, 'IYYY-IW') DESC`);

  const weekStrings = weeks.map((w) => w.yearWeek);

  if (weekStrings.length === 0) {
    const responseData: StreakResponse = {
      currentStreak: 0,
      longestStreak: 0,
    };
    return c.json(successResponse(responseData));
  }

  // Calculate current streak
  // Check if current week or last week is included
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeek = getISOWeek(now);
  const currentWeekStr = `${currentYear}-${String(currentWeek).padStart(2, "0")}`;

  const lastWeekDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekYear = lastWeekDate.getFullYear();
  const lastWeek = getISOWeek(lastWeekDate);
  const lastWeekStr = `${lastWeekYear}-${String(lastWeek).padStart(2, "0")}`;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check if streak is active (includes current or last week)
  if (weekStrings[0] === currentWeekStr || weekStrings[0] === lastWeekStr) {
    // Calculate current streak from most recent week
    for (let i = 0; i < weekStrings.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        tempStreak = 1;
        continue;
      }

      const prevWeek = getPreviousWeek(weekStrings[i - 1]);
      if (weekStrings[i] === prevWeek) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < weekStrings.length; i++) {
    const prevWeek = getPreviousWeek(weekStrings[i - 1]);
    if (weekStrings[i] === prevWeek) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  const responseData: StreakResponse = {
    currentStreak,
    longestStreak,
  };

  return c.json(successResponse(responseData));
};

// Helper to get ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Helper to get previous week string
function getPreviousWeek(yearWeek: string): string {
  const [year, week] = yearWeek.split("-").map(Number);
  if (week === 1) {
    return `${year - 1}-52`;
  }
  return `${year}-${String(week - 1).padStart(2, "0")}`;
}

