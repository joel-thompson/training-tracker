import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Goal, UpdateGoalInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { goalKeys } from "./goalKeys";

async function updateGoal(
  id: string,
  input: UpdateGoalInput,
  token: string | null
): Promise<Goal> {
  const response = await api(`/api/v1/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<Goal>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useUpdateGoal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateGoalInput;
    }) => {
      const token = await getToken();
      return updateGoal(id, input, token);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: goalKeys.byId(data.id),
      });
      void queryClient.invalidateQueries({ queryKey: goalKeys.allLists() });
      void queryClient.invalidateQueries({ queryKey: goalKeys.active() });
    },
  });
}
