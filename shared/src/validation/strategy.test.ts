import { describe, expect, it } from "vitest";
import { GAME_STRATEGY_MAX_LENGTH } from "../constants";
import { upsertGameStrategySchema } from "./strategy";

describe("upsertGameStrategySchema", () => {
  it("accepts valid markdown", () => {
    const parsed = upsertGameStrategySchema.safeParse({
      markdown: "# Strategy\n\nI prefer to attack the legs.",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects whitespace-only markdown", () => {
    const parsed = upsertGameStrategySchema.safeParse({
      markdown: "   \n\t  ",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects markdown over the length limit", () => {
    const parsed = upsertGameStrategySchema.safeParse({
      markdown: "a".repeat(GAME_STRATEGY_MAX_LENGTH + 1),
    });

    expect(parsed.success).toBe(false);
  });
});
