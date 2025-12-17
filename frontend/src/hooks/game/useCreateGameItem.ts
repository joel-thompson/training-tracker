import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GameItem, CreateGameItemInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function createGameItem(
  input: CreateGameItemInput,
  token: string | null
): Promise<GameItem> {
  const response = await api("/api/v1/game/items", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<GameItem>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useCreateGameItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<GameItem, Error, CreateGameItemInput>({
    mutationFn: async (input: CreateGameItemInput): Promise<GameItem> => {
      const token = await getToken();
      return createGameItem(input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gameKeys.allItems() });
      void queryClient.invalidateQueries({
        queryKey: gameKeys.allTransitions(),
      });
    },
  });
}
