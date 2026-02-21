import type { GoalCategory } from "shared/types";

export const categoryLabels: Record<GoalCategory, string> = {
  bottom: "Bottom",
  top: "Top",
  submission: "Submission",
  escape: "Escape",
};

export const categoryOrder: (GoalCategory | null)[] = [
  "bottom",
  "top",
  "submission",
  "escape",
  null,
];
