import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GameTransition,
  UpdateGameTransitionInput,
  ApiResponse,
} from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function updateGameTransition(
  id: string,
  input: UpdateGameTransitionInput,
  token: string | null
): Promise<GameTransition> {
  const response = await api(`/api/v1/game/transitions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<GameTransition>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useUpdateGameTransition() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateGameTransitionInput;
    }) => {
      const token = await getToken();
      return updateGameTransition(id, input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: gameKeys.allTransitions(),
      });
    },
  });
}
