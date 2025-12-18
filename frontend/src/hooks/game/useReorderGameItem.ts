import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GameItem, ReorderGameItemInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function reorderGameItem(
  id: string,
  input: ReorderGameItemInput,
  token: string | null
): Promise<GameItem> {
  const response = await api(`/api/v1/game/items/${id}/reorder`, {
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

export function useReorderGameItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      direction,
    }: {
      id: string;
      direction: "up" | "down";
    }) => {
      const token = await getToken();
      return reorderGameItem(id, { direction }, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gameKeys.allItems() });
      void queryClient.invalidateQueries({
        queryKey: gameKeys.allTransitions(),
      });
    },
  });
}
