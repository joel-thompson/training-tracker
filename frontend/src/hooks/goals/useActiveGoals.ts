import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { ActiveGoalsResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { goalKeys } from "./goalKeys";

async function fetchActiveGoals(
  token: string | null
): Promise<ActiveGoalsResponse> {
  const response = await api("/api/v1/goals/active", { token });

  const result = (await response.json()) as ApiResponse<ActiveGoalsResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useActiveGoals() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: goalKeys.active(),
    queryFn: async () => {
      const token = await getToken();
      return fetchActiveGoals(token);
    },
  });
}
