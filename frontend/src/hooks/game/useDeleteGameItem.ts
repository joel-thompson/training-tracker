import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeleteGameItemResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function deleteGameItem(
  id: string,
  token: string | null
): Promise<DeleteGameItemResponse> {
  const response = await api(`/api/v1/game/items/${id}`, {
    method: "DELETE",
    token,
  });

  const result = (await response.json()) as ApiResponse<DeleteGameItemResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useDeleteGameItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteGameItem(id, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gameKeys.allItems() });
      void queryClient.invalidateQueries({
        queryKey: gameKeys.allTransitions(),
      });
    },
  });
}
