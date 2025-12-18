import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GameItem, UpdateGameItemInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function updateGameItem(
  id: string,
  input: UpdateGameItemInput,
  token: string | null
): Promise<GameItem> {
  const response = await api(`/api/v1/game/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<GameItem>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useUpdateGameItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateGameItemInput;
    }) => {
      const token = await getToken();
      return updateGameItem(id, input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gameKeys.allItems() });
      void queryClient.invalidateQueries({
        queryKey: gameKeys.allTransitions(),
      });
    },
  });
}
