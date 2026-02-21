import { sql } from "drizzle-orm";
import { type sessionItems, type trainingSessions, trainingGoals } from "../db/schema";
import type { Session, SessionItem, Goal } from "shared/types";

export const toSessionItemResponse = (
  item: typeof sessionItems.$inferSelect
): SessionItem => ({
  id: item.id,
  sessionId: item.sessionId,
  type: item.type,
  content: item.content,
  order: item.order,
  createdAt: item.createdAt.toISOString(),
});

export const toSessionResponse = (
  session: typeof trainingSessions.$inferSelect,
  items: (typeof sessionItems.$inferSelect)[]
): Session => ({
  id: session.id,
  userId: session.userId,
  sessionDate: session.sessionDate,
  classType: session.classType,
  techniqueCovered: session.techniqueCovered,
  generalNotes: session.generalNotes,
  createdAt: session.createdAt.toISOString(),
  updatedAt: session.updatedAt.toISOString(),
  items: items.map(toSessionItemResponse),
});

export const toGoalResponse = (
  goal: typeof trainingGoals.$inferSelect
): Goal => ({
  id: goal.id,
  userId: goal.userId,
  goalText: goal.goalText,
  category: goal.category,
  notes: goal.notes,
  isActive: goal.isActive,
  createdAt: goal.createdAt.toISOString(),
  completedAt: goal.completedAt?.toISOString() ?? null,
});

export const goalCategorySortOrder = sql`CASE
  WHEN ${trainingGoals.category} = 'bottom' THEN 1
  WHEN ${trainingGoals.category} = 'top' THEN 2
  WHEN ${trainingGoals.category} = 'submission' THEN 3
  WHEN ${trainingGoals.category} = 'escape' THEN 4
  ELSE 5
END`;
