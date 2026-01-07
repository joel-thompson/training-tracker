import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { StreakResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { statsKeys } from "./statsKeys";

async function fetchStreak(token: string | null): Promise<StreakResponse> {
  const response = await api("/api/v1/stats/streak", { token });

  const result = (await response.json()) as ApiResponse<StreakResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useWeeklyStreak() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: statsKeys.streak(),
    queryFn: async () => {
      const token = await getToken();
      return fetchStreak(token);
    },
  });
}

