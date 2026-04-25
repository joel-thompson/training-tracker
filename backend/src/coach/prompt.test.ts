import { describe, expect, it } from "vitest";
import type { TrainingContext } from "./context";
import {
  buildCoachSystemPrompt,
  formatActiveGoals,
  formatCompletedGoals,
  formatTrainingSessions,
} from "./prompt";

const emptyContext: TrainingContext = {
  sessions: [],
  goals: [],
  stats: {
    totalSessions: 0,
    giCount: 0,
    nogiCount: 0,
  },
};

describe("coach prompt formatting", () => {
  it("formats empty context fallbacks", () => {
    expect(formatTrainingSessions(emptyContext)).toBe("No recent sessions logged.");
    expect(formatActiveGoals(emptyContext)).toBe("No active goals set.");
    expect(formatCompletedGoals(emptyContext)).toBe("No completed goals yet.");
  });

  it("formats sessions and goals with useful training details", () => {
    const context: TrainingContext = {
      sessions: [
        {
          id: "session-1",
          sessionDate: "2026-04-10",
          classType: "gi",
          techniqueCovered: "Half guard knee shield",
          generalNotes: "Felt better keeping frames inside.",
          items: [
            { type: "success", content: "Recovered guard twice" },
            { type: "problem", content: "Lost underhook" },
            { type: "question", content: "When should I switch to deep half?" },
          ],
        },
      ],
      goals: [
        {
          goalText: "Improve guard retention",
          category: "bottom",
          notes: "Focus on knee shield and frames",
          isActive: true,
          completedAt: null,
        },
        {
          goalText: "Finish armbar from mount",
          category: "submission",
          notes: null,
          isActive: false,
          completedAt: "2026-04-01T00:00:00.000Z",
        },
      ],
      stats: {
        totalSessions: 1,
        giCount: 1,
        nogiCount: 0,
      },
    };

    expect(formatTrainingSessions(context)).toContain("Technique: Half guard knee shield");
    expect(formatTrainingSessions(context)).toContain("Successes: Recovered guard twice");
    expect(formatTrainingSessions(context)).toContain("Problems: Lost underhook");
    expect(formatTrainingSessions(context)).toContain(
      "Questions: When should I switch to deep half?"
    );
    expect(formatActiveGoals(context)).toBe(
      "- Improve guard retention (bottom) - Focus on knee shield and frames"
    );
    expect(formatCompletedGoals(context)).toBe(
      "- Finish armbar from mount (completed 2026-04-01T00:00:00.000Z)"
    );
  });

  it("builds a deterministic system prompt when today is injected", () => {
    const prompt = buildCoachSystemPrompt(emptyContext, "2026-04-25");

    expect(prompt).toContain("You are a supportive BJJ");
    expect(prompt).toContain("Total sessions: 0");
    expect(prompt).toContain("No recent sessions logged.");
    expect(prompt).toContain("Today's date is: 2026-04-25");
  });
});

