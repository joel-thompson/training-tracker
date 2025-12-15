import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions, sessionItems } from "../../db/schema";
import { listSessionsQuerySchema } from "shared/validation";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { Session, SessionItem, ListSessionsResponse } from "shared/types";
import { eq, and, isNull, desc, gte, lte, sql, count } from "drizzle-orm";

export const listSessionsHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const query: unknown = c.req.query();
  const parsed = listSessionsQuerySchema.safeParse(query);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const { limit, cursor, classType, weekStartDate, excludeItems } = parsed.data;

  // Build where conditions
  const conditions = [
    eq(trainingSessions.userId, userId),
    isNull(trainingSessions.deletedAt),
  ];

  if (classType) {
    conditions.push(eq(trainingSessions.classType, classType));
  }

  if (weekStartDate) {
    // Filter sessions within the week (Sunday to Saturday)
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    conditions.push(gte(trainingSessions.sessionDate, weekStartDate));
    conditions.push(lte(trainingSessions.sessionDate, weekEndStr));
  }

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(trainingSessions)
    .where(and(...conditions));
  const total = totalResult?.count ?? 0;

  // If cursor provided, add pagination condition
  if (cursor) {
    const cursorSession = await db
      .select({
        sessionDate: trainingSessions.sessionDate,
        createdAt: trainingSessions.createdAt,
      })
      .from(trainingSessions)
      .where(eq(trainingSessions.id, cursor))
      .limit(1);

    if (cursorSession.length > 0) {
      const cursorData = cursorSession[0];
      conditions.push(
        sql`(${trainingSessions.sessionDate}, ${trainingSessions.createdAt}, ${trainingSessions.id}) < (${cursorData.sessionDate}, ${cursorData.createdAt}, ${cursor})`
      );
    }
  }

  // Fetch sessions
  const sessions = await db
    .select()
    .from(trainingSessions)
    .where(and(...conditions))
    .orderBy(
      desc(trainingSessions.sessionDate),
      desc(trainingSessions.createdAt)
    )
    .limit(limit + 1);

  const hasMore = sessions.length > limit;
  const resultSessions = hasMore ? sessions.slice(0, limit) : sessions;
  const nextCursor = hasMore
    ? resultSessions[resultSessions.length - 1]?.id ?? null
    : null;

  // Fetch items if not excluded
  const itemsMap = new Map<string, SessionItem[]>();
  if (!excludeItems && resultSessions.length > 0) {
    const sessionIds = resultSessions.map((s) => s.id);
    const items = await db
      .select()
      .from(sessionItems)
      .where(
        sql`${sessionItems.sessionId} IN (${sql.join(
          sessionIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
      .orderBy(sessionItems.type, sessionItems.order);

    for (const item of items) {
      const existing = itemsMap.get(item.sessionId) ?? [];
      existing.push({
        id: item.id,
        sessionId: item.sessionId,
        type: item.type,
        content: item.content,
        order: item.order,
        createdAt: item.createdAt.toISOString(),
      });
      itemsMap.set(item.sessionId, existing);
    }
  }

  const responseData: ListSessionsResponse = {
    sessions: resultSessions.map((session) => {
      const base: Session = {
        id: session.id,
        userId: session.userId,
        sessionDate: session.sessionDate,
        classType: session.classType,
        techniqueCovered: session.techniqueCovered,
        generalNotes: session.generalNotes,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      };

      if (!excludeItems) {
        base.items = itemsMap.get(session.id) ?? [];
      }

      return base;
    }),
    pagination: {
      nextCursor,
      hasMore,
      total,
    },
  };

  return c.json(successResponse(responseData));
};
