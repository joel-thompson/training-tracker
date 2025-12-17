import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { ListGameTransitionsResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { gameKeys } from "./gameKeys";

async function fetchGameTransitions(
  token: string | null
): Promise<ListGameTransitionsResponse> {
  const response = await api("/api/v1/game/transitions", { token });

  const result =
    (await response.json()) as ApiResponse<ListGameTransitionsResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useGameTransitions() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: gameKeys.transitions(),
    queryFn: async () => {
      const token = await getToken();
      return fetchGameTransitions(token);
    },
  });
}
