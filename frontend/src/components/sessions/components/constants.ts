import type { ClassType, ItemType } from "shared/types";

export const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  gi: "Gi",
  nogi: "No-Gi",
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  success: "Success",
  problem: "Problem",
  question: "Question",
};
