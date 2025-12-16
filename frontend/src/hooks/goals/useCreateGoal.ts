import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Goal, CreateGoalInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { goalKeys } from "./goalKeys";

async function createGoal(
  input: CreateGoalInput,
  token: string | null
): Promise<Goal> {
  const response = await api("/api/v1/goals", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<Goal>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useCreateGoal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const token = await getToken();
      return createGoal(input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.allLists() });
      void queryClient.invalidateQueries({ queryKey: goalKeys.active() });
    },
  });
}
