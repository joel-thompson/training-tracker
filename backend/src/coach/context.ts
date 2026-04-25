import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import type { ClassType, GoalCategory, ItemType } from "shared/types";
import { db } from "../db";
import { sessionItems, trainingGoals, trainingSessions } from "../db/schema";

export interface TrainingContextSession {
  id: string;
  sessionDate: string;
  classType: ClassType;
  techniqueCovered: string | null;
  generalNotes: string | null;
  items: {
    type: ItemType;
    content: string;
  }[];
}

export interface TrainingContextGoal {
  goalText: string;
  category: GoalCategory | null;
  notes: string | null;
  isActive: boolean;
  completedAt: string | null;
}

export interface TrainingContext {
  sessions: TrainingContextSession[];
  goals: TrainingContextGoal[];
  stats: {
    totalSessions: number;
    giCount: number;
    nogiCount: number;
  };
}

export async function fetchTrainingContext(userId: string): Promise<TrainingContext> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

  const sessions = await db
    .select()
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        isNull(trainingSessions.deletedAt),
        gte(trainingSessions.sessionDate, ninetyDaysAgoStr)
      )
    )
    .orderBy(desc(trainingSessions.sessionDate))
    .limit(50);

  const sessionIds = sessions.map((session) => session.id);
  const items =
    sessionIds.length > 0
      ? await db
          .select()
          .from(sessionItems)
          .where(
            sql`${sessionItems.sessionId} IN (${sql.join(
              sessionIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
      : [];

  const itemsBySession = new Map<string, { type: ItemType; content: string }[]>();
  for (const item of items) {
    const existing = itemsBySession.get(item.sessionId) ?? [];
    existing.push({ type: item.type, content: item.content });
    itemsBySession.set(item.sessionId, existing);
  }

  const goals = await db
    .select()
    .from(trainingGoals)
    .where(eq(trainingGoals.userId, userId))
    .orderBy(desc(trainingGoals.createdAt));

  const giCount = sessions.filter((session) => session.classType === "gi").length;
  const nogiCount = sessions.filter((session) => session.classType === "nogi").length;

  return {
    sessions: sessions.map((session) => ({
      id: session.id,
      sessionDate: session.sessionDate,
      classType: session.classType,
      techniqueCovered: session.techniqueCovered,
      generalNotes: session.generalNotes,
      items: itemsBySession.get(session.id) ?? [],
    })),
    goals: goals.map((goal) => ({
      goalText: goal.goalText,
      category: goal.category,
      notes: goal.notes,
      isActive: goal.isActive,
      completedAt: goal.completedAt?.toISOString() ?? null,
    })),
    stats: {
      totalSessions: sessions.length,
      giCount,
      nogiCount,
    },
  };
}

