import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, DeleteGameStrategyResponse } from "shared/types";
import { api } from "@/utils/api";
import { strategyKeys } from "./strategyKeys";

export async function deleteGameStrategy(
  token: string | null,
): Promise<DeleteGameStrategyResponse> {
  const response = await api("/api/v1/strategy", {
    method: "DELETE",
    token,
  });

  const result =
    (await response.json()) as ApiResponse<DeleteGameStrategyResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useDeleteGameStrategy() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return deleteGameStrategy(token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: strategyKeys.detail() });
    },
  });
}
