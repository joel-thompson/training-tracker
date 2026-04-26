import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, GetGameStrategyResponse } from "shared/types";
import { api } from "@/utils/api";
import { strategyKeys } from "./strategyKeys";

export async function fetchGameStrategy(
  token: string | null,
): Promise<GetGameStrategyResponse> {
  const response = await api("/api/v1/strategy", { token });

  const result =
    (await response.json()) as ApiResponse<GetGameStrategyResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useGameStrategy() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: strategyKeys.detail(),
    queryFn: async () => {
      const token = await getToken();
      return fetchGameStrategy(token);
    },
  });
}
