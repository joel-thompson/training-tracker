import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { Goal, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { goalKeys } from "./goalKeys";

async function fetchGoal(id: string, token: string | null): Promise<Goal> {
  const response = await api(`/api/v1/goals/${id}`, { token });

  const result = (await response.json()) as ApiResponse<Goal>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useGoal(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: goalKeys.byId(id),
    queryFn: async () => {
      const token = await getToken();
      return fetchGoal(id, token);
    },
    enabled: !!id,
  });
}
