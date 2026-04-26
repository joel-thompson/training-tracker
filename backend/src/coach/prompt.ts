import type { TrainingContext } from "./context";
import { bjjFundamentals } from "./bjjFundamentals";

export function formatTrainingSessions(context: TrainingContext): string {
  if (context.sessions.length === 0) {
    return "No recent sessions logged.";
  }

  return context.sessions
    .map((session) => {
      const lines = [`- ${session.sessionDate} (${session.sessionType}, ${session.classType})`];

      if (session.techniqueCovered) {
        lines.push(`  Technique: ${session.techniqueCovered}`);
      }

      if (session.items.length > 0) {
        const successes = session.items
          .filter((item) => item.type === "success")
          .map((item) => item.content);
        const problems = session.items
          .filter((item) => item.type === "problem")
          .map((item) => item.content);
        const questions = session.items
          .filter((item) => item.type === "question")
          .map((item) => item.content);

        if (successes.length > 0) lines.push(`  Successes: ${successes.join("; ")}`);
        if (problems.length > 0) lines.push(`  Problems: ${problems.join("; ")}`);
        if (questions.length > 0) lines.push(`  Questions: ${questions.join("; ")}`);
      }

      if (session.generalNotes) {
        lines.push(`  Notes: ${session.generalNotes}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

export function formatActiveGoals(context: TrainingContext): string {
  const activeGoals = context.goals.filter((goal) => goal.isActive);

  if (activeGoals.length === 0) {
    return "No active goals set.";
  }

  return activeGoals
    .map((goal) => {
      let line = `- ${goal.goalText}`;
      if (goal.category) line += ` (${goal.category})`;
      if (goal.notes) line += ` - ${goal.notes}`;
      return line;
    })
    .join("\n");
}

export function formatCompletedGoals(context: TrainingContext): string {
  const completedGoals = context.goals.filter((goal) => !goal.isActive);

  if (completedGoals.length === 0) {
    return "No completed goals yet.";
  }

  return completedGoals
    .slice(0, 5)
    .map((goal) => `- ${goal.goalText} (completed ${goal.completedAt ?? "unknown"})`)
    .join("\n");
}

export function buildCoachSystemPrompt(context: TrainingContext, today = getTodayDate()): string {
  return `You are a supportive BJJ (Brazilian Jiu-Jitsu) training coach helping a practitioner reflect on and improve their training.

${bjjFundamentals}

## User's Training Context

### Training Stats (Last 90 Days)
- Total sessions: ${context.stats.totalSessions}
- Gi sessions: ${context.stats.giCount}
- No-Gi sessions: ${context.stats.nogiCount}

### Recent Training Sessions
${formatTrainingSessions(context)}

### Active Goals
${formatActiveGoals(context)}

### Recently Completed Goals
${formatCompletedGoals(context)}

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

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}
