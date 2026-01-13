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
  classType: "gi" | "nogi";
  techniqueCovered: string | null;
  generalNotes: string | null;
  items: {
    type: "success" | "problem" | "question";
    content: string;
  }[];
}

interface Goal {
  goalText: string;
  category: string | null;
  notes: string | null;
  isActive: boolean;
  completedAt: string | null;
}

interface UserContext {
  sessions: SessionWithItems[];
  goals: Goal[];
  stats: {
    totalSessions: number;
    giCount: number;
    nogiCount: number;
  };
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
    { type: "success" | "problem" | "question"; content: string }[]
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

function buildSystemPrompt(context: UserContext): string {
  const today = new Date().toISOString().split("T")[0];

  const sessionsText =
    context.sessions.length > 0
      ? context.sessions
          .map((s) => {
            const lines = [`- ${s.sessionDate} (${s.classType})`];
            if (s.techniqueCovered) {
              lines.push(`  Technique: ${s.techniqueCovered}`);
            }
            if (s.items.length > 0) {
              const successes = s.items
                .filter((i) => i.type === "success")
                .map((i) => i.content);
              const problems = s.items
                .filter((i) => i.type === "problem")
                .map((i) => i.content);
              const questions = s.items
                .filter((i) => i.type === "question")
                .map((i) => i.content);

              if (successes.length > 0)
                lines.push(`  Successes: ${successes.join("; ")}`);
              if (problems.length > 0)
                lines.push(`  Problems: ${problems.join("; ")}`);
              if (questions.length > 0)
                lines.push(`  Questions: ${questions.join("; ")}`);
            }
            if (s.generalNotes) {
              lines.push(`  Notes: ${s.generalNotes}`);
            }
            return lines.join("\n");
          })
          .join("\n\n")
      : "No recent sessions logged.";

  const activeGoals = context.goals.filter((g) => g.isActive);
  const completedGoals = context.goals.filter((g) => !g.isActive);

  const goalsText =
    activeGoals.length > 0
      ? activeGoals
          .map((g) => {
            let line = `- ${g.goalText}`;
            if (g.category) line += ` (${g.category})`;
            if (g.notes) line += ` — ${g.notes}`;
            return line;
          })
          .join("\n")
      : "No active goals set.";

  const completedGoalsText =
    completedGoals.length > 0
      ? completedGoals
          .slice(0, 5)
          .map(
            (g) => `- ${g.goalText} (completed ${g.completedAt ?? "unknown"})`
          )
          .join("\n")
      : "No completed goals yet.";

  return `You are a supportive BJJ (Brazilian Jiu-Jitsu) training coach helping a practitioner reflect on and improve their training.

## User's Training Context

### Training Stats (Last 90 Days)
- Total sessions: ${context.stats.totalSessions}
- Gi sessions: ${context.stats.giCount}
- No-Gi sessions: ${context.stats.nogiCount}

### Recent Training Sessions
${sessionsText}

### Active Goals
${goalsText}

### Recently Completed Goals
${completedGoalsText}

## Guidelines
- Be encouraging but honest
- Reference specific sessions, dates, and details when relevant
- Keep responses concise (2-3 paragraphs max unless the user asks for more detail)
- Use BJJ terminology naturally (positions, submissions, sweeps, etc.)
- If asked about something not in the training data, say so honestly
- When identifying patterns, be specific about dates and occurrences
- Suggest actionable next steps when appropriate

Today's date is: ${today}`;
}
