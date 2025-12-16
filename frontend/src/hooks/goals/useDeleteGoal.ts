import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, DeleteGoalResponse } from "shared/types";
import { api } from "@/utils/api";
import { goalKeys } from "./goalKeys";

async function deleteGoal(
  id: string,
  token: string | null
): Promise<DeleteGoalResponse> {
  const response = await api(`/api/v1/goals/${id}`, {
    method: "DELETE",
    token,
  });

  const result = (await response.json()) as ApiResponse<DeleteGoalResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useDeleteGoal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteGoal(id, token);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.allLists() });
      void queryClient.invalidateQueries({ queryKey: goalKeys.active() });
      void queryClient.invalidateQueries({
        queryKey: goalKeys.byId(data.id),
      });
    },
  });
}
