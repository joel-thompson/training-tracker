import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session, CreateSessionInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

export function useCreateSession() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      const token = await getToken();
      const response = await api("/api/sessions", {
        method: "POST",
        body: JSON.stringify(input),
        token,
      });

      const result = (await response.json()) as ApiResponse<Session>;
      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.allLists() });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.dates() });
    },
  });
}
