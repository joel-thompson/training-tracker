import type { ClassType, ItemType } from "../types";

export const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  gi: "Gi",
  nogi: "No-Gi",
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  success: "Success",
  problem: "Problem",
  question: "Question",
};

export const ITEM_TYPES = [
  "success",
  "problem",
  "question",
] as const satisfies readonly ItemType[];
