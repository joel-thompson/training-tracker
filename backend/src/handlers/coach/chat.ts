import type { Context } from "hono";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { db } from "../../db";
import { trainingSessions, sessionItems, trainingGoals } from "../../db/schema";
import { requireUserId, requireAiAccess } from "../../utils/auth";
import { errorResponse, ErrorCodes } from "../../utils/response";
import { getEnvRequired } from "../../utils/env";
import { eq, and, isNull, desc, gte, sql } from "drizzle-orm";
import { chatRequestSchema } from "shared/validation";
import type { ClassType, ItemType } from "shared/types";
import { buildSystemPrompt, type UserContext } from "../../llm-context/bjj";

export const chatHandler = async (c: Context) => {
  const userId = requireUserId(c);
  await requireAiAccess(userId);

  const body: unknown = await c.req.json();
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const { messages } = parsed.data;

  // Fetch user's training context
  const context = await fetchUserContext(userId);
  const systemPrompt = buildSystemPrompt(context);

  const openai = createOpenAI({
    apiKey: getEnvRequired("OPENAI_API_KEY"),
  });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  });

  // Return streaming response compatible with useChat hook
  return result.toTextStreamResponse();
};

interface SessionWithItems {
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

async function fetchUserContext(userId: string): Promise<UserContext> {
  // Fetch sessions from last 90 days
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

  // Fetch items for these sessions
  const sessionIds = sessions.map((s) => s.id);
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

  // Group items by session
  const itemsBySession = new Map<
    string,
    { type: ItemType; content: string }[]
  >();
  for (const item of items) {
    const existing = itemsBySession.get(item.sessionId) ?? [];
    existing.push({ type: item.type, content: item.content });
    itemsBySession.set(item.sessionId, existing);
  }

  const sessionsWithItems: SessionWithItems[] = sessions.map((s) => ({
    id: s.id,
    sessionDate: s.sessionDate,
    classType: s.classType,
    techniqueCovered: s.techniqueCovered,
    generalNotes: s.generalNotes,
    items: itemsBySession.get(s.id) ?? [],
  }));

  // Fetch goals
  const goals = await db
    .select()
    .from(trainingGoals)
    .where(eq(trainingGoals.userId, userId))
    .orderBy(desc(trainingGoals.createdAt));

  // Calculate stats
  const giCount = sessions.filter((s) => s.classType === "gi").length;
  const nogiCount = sessions.filter((s) => s.classType === "nogi").length;

  return {
    sessions: sessionsWithItems,
    goals: goals.map((g) => ({
      goalText: g.goalText,
      category: g.category,
      notes: g.notes,
      isActive: g.isActive,
      completedAt: g.completedAt?.toISOString() ?? null,
    })),
    stats: {
      totalSessions: sessions.length,
      giCount,
      nogiCount,
    },
  };
}
