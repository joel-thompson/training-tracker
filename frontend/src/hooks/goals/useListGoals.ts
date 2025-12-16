import { useAuth } from "@clerk/clerk-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ListGoalsResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { goalKeys, type ListGoalsParams } from "./goalKeys";

async function fetchListGoals(
  params: ListGoalsParams & { cursor?: string },
  token: string | null
): Promise<ListGoalsResponse> {
  const searchParams = new URLSearchParams();
  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }
  if (params.active !== undefined) {
    searchParams.set("active", params.active ? "true" : "false");
  }

  const queryString = searchParams.toString();
  const path = `/api/v1/goals${queryString ? `?${queryString}` : ""}`;
  const response = await api(path, { token });

  const result = (await response.json()) as ApiResponse<ListGoalsResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useListGoals(params: ListGoalsParams = {}) {
  const { getToken } = useAuth();

  return useInfiniteQuery({
    queryKey: goalKeys.list(params),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      return fetchListGoals({ ...params, cursor: pageParam }, token);
    },
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

