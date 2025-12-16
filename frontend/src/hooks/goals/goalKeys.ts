export interface ListGoalsParams {
  limit?: number;
  active?: boolean;
}

export const goalKeys = {
  all: ["goals"] as const,

  // Invalidation keys (broad)
  allLists: () => [...goalKeys.all, "list"] as const,
  allById: () => [...goalKeys.all, "byId"] as const,

  // Query keys (specific)
  list: (filters: ListGoalsParams) =>
    [...goalKeys.allLists(), filters] as const,
  byId: (id: string) => [...goalKeys.allById(), id] as const,
  active: () => [...goalKeys.all, "active"] as const,
};
