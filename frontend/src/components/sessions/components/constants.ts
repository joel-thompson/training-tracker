import type { ClassType, ItemType } from "shared/types";

export const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  gi: "Gi",
  nogi: "No-Gi",
  open_mat: "Open Mat",
  private: "Private",
  competition: "Competition",
  other: "Other",
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  success: "Success",
  problem: "Problem",
  question: "Question",
};
