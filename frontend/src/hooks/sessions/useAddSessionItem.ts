import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateItemInput, ApiResponse, SessionItem } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

export function useAddSessionItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      input,
    }: {
      sessionId: string;
      input: CreateItemInput;
    }) => {
      const token = await getToken();
      const response = await api(`/api/v1/sessions/${sessionId}/items`, {
        method: "POST",
        body: JSON.stringify(input),
        token,
      });

      const result = (await response.json()) as ApiResponse<SessionItem>;
      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.byId(data.sessionId),
      });
    },
  });
}
