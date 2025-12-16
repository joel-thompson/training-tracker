import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Goal, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { goalKeys } from "./goalKeys";

async function completeGoal(id: string, token: string | null): Promise<Goal> {
  const response = await api(`/api/v1/goals/${id}/complete`, {
    method: "POST",
    token,
  });

  const result = (await response.json()) as ApiResponse<Goal>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useCompleteGoal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return completeGoal(id, token);
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
