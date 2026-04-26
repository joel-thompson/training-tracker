import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  GameStrategy,
  UpsertGameStrategyInput,
} from "shared/types";
import { api } from "@/utils/api";
import { strategyKeys } from "./strategyKeys";

export async function saveGameStrategy(
  input: UpsertGameStrategyInput,
  token: string | null,
): Promise<GameStrategy> {
  const response = await api("/api/v1/strategy", {
    method: "PUT",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<GameStrategy>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useSaveGameStrategy() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertGameStrategyInput) => {
      const token = await getToken();
      return saveGameStrategy(input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: strategyKeys.detail() });
    },
  });
}
