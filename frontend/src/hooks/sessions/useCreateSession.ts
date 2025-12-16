import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session, CreateSessionInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

async function createSession(
  input: CreateSessionInput,
  token: string | null
): Promise<Session> {
  const response = await api("/api/v1/sessions", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<Session>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useCreateSession() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      const token = await getToken();
      return createSession(input, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.allLists() });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.dates() });
    },
  });
}
