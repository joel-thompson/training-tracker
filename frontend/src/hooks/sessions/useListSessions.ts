import { useAuth } from "@clerk/clerk-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ListSessionsResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys, type ListSessionsParams } from "./sessionKeys";

async function fetchListSessions(
  params: ListSessionsParams & { cursor?: string },
  token: string | null
): Promise<ListSessionsResponse> {
  const searchParams = new URLSearchParams();
  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }
  if (params.classType) {
    searchParams.set("classType", params.classType);
  }
  if (params.weekStartDate) {
    searchParams.set("weekStartDate", params.weekStartDate);
  }
  if (params.excludeItems !== undefined) {
    searchParams.set("excludeItems", params.excludeItems ? "true" : "false");
  }

  const queryString = searchParams.toString();
  const path = `/api/sessions${queryString ? `?${queryString}` : ""}`;
  const response = await api(path, { token });

  const result = (await response.json()) as ApiResponse<ListSessionsResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useListSessions(params: ListSessionsParams = {}) {
  const { getToken } = useAuth();

  return useInfiniteQuery({
    queryKey: sessionKeys.list(params),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      return fetchListSessions({ ...params, cursor: pageParam }, token);
    },
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}
