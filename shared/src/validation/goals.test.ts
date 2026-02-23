import { describe, it, expect } from "vitest";
import { createGoalSchema } from "./goals";

describe("createGoalSchema", () => {
  it("accepts valid input", () => {
    const result = createGoalSchema.safeParse({
      goalText: "Improve guard passing",
      category: "top",
      notes: "Focus on knee cut",
    });
    expect(result.success).toBe(true);
  });

  it("defaults isActive to true", () => {
    const result = createGoalSchema.safeParse({ goalText: "Improve guard passing" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });

  it("rejects empty goalText", () => {
    const result = createGoalSchema.safeParse({ goalText: "" });
    expect(result.success).toBe(false);
  });

  it("rejects goalText exceeding 500 characters", () => {
    const result = createGoalSchema.safeParse({ goalText: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects notes exceeding 1000 characters", () => {
    const result = createGoalSchema.safeParse({
      goalText: "Improve guard passing",
      notes: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category enum value", () => {
    const result = createGoalSchema.safeParse({
      goalText: "Improve guard passing",
      category: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid category values", () => {
    const categories = ["bottom", "top", "submission", "escape"] as const;
    for (const category of categories) {
      const result = createGoalSchema.safeParse({ goalText: "test", category });
      expect(result.success).toBe(true);
    }
  });
});
