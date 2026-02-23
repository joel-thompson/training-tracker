import type { GoalCategory } from "../types";

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  bottom: "Bottom",
  top: "Top",
  submission: "Submission",
  escape: "Escape",
};

export const GOAL_CATEGORY_ORDER: readonly (GoalCategory | null)[] = [
  "bottom",
  "top",
  "submission",
  "escape",
  null,
];
