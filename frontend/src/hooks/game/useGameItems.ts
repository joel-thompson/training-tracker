import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { ListGameItemsResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function fetchGameItems(
  token: string | null
): Promise<ListGameItemsResponse> {
  const response = await api("/api/v1/game/items", { token });

  const result = (await response.json()) as ApiResponse<ListGameItemsResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useGameItems() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: gameKeys.items(),
    queryFn: async () => {
      const token = await getToken();
      return fetchGameItems(token);
    },
  });
}
