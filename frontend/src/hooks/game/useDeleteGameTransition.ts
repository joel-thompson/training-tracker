import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeleteGameTransitionResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function deleteGameTransition(
  id: string,
  token: string | null
): Promise<DeleteGameTransitionResponse> {
  const response = await api(`/api/v1/game/transitions/${id}`, {
    method: "DELETE",
    token,
  });

  const result =
    (await response.json()) as ApiResponse<DeleteGameTransitionResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useDeleteGameTransition() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteGameTransition(id, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: gameKeys.allTransitions(),
      });
    },
  });
}
