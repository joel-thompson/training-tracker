import type { ClassType, ItemType, SessionType } from "../types";

export const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  gi: "Gi",
  nogi: "No-Gi",
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  class: "Class",
  open_mat: "Open Mat",
  drilling: "Drilling",
  sparring: "Sparring",
  competition: "Competition",
  private: "Private",
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  success: "Success",
  problem: "Problem",
  question: "Question",
};

export const ITEM_TYPES = ["success", "problem", "question"] as const satisfies readonly ItemType[];

export const SESSION_TYPES = [
  "class",
  "open_mat",
  "drilling",
  "sparring",
  "competition",
  "private",
] as const satisfies readonly SessionType[];
