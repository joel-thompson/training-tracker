import type { ClassType } from "shared/types";

export interface ListSessionsParams {
  limit?: number;
  classType?: ClassType;
  weekStartDate?: string;
  excludeItems?: boolean;
}

export const sessionKeys = {
  all: ["sessions"] as const,

  // Invalidation keys (broad)
  allLists: () => [...sessionKeys.all, "list"] as const,
  allById: () => [...sessionKeys.all, "byId"] as const,

  // Query keys (specific)
  list: (filters: ListSessionsParams) =>
    [...sessionKeys.allLists(), filters] as const,
  byId: (id: string) => [...sessionKeys.allById(), id] as const,
  dates: () => [...sessionKeys.all, "dates"] as const,
};
