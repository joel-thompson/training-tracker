import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GameTransition,
  CreateGameTransitionInput,
  ApiResponse,
} from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function createGameTransition(
  input: CreateGameTransitionInput,
  token: string | null
): Promise<GameTransition> {
  const response = await api("/api/v1/game/transitions", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<GameTransition>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useCreateGameTransition() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<GameTransition, Error, CreateGameTransitionInput>({
    mutationFn: async (
      input: CreateGameTransitionInput
    ): Promise<GameTransition> => {
      const token = await getToken();
      return createGameTransition(input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: gameKeys.allTransitions(),
      });
    },
  });
}
