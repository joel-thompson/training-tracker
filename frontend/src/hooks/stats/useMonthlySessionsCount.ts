import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { MonthlySessionsResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { statsKeys } from "./statsKeys";

async function fetchMonthlySessions(
  token: string | null
): Promise<MonthlySessionsResponse> {
  const response = await api("/api/v1/stats/monthly", { token });

  const result = (await response.json()) as ApiResponse<MonthlySessionsResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useMonthlySessionsCount() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: statsKeys.monthly(),
    queryFn: async () => {
      const token = await getToken();
      return fetchMonthlySessions(token);
    },
  });
}

