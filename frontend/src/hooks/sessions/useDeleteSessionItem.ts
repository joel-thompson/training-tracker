import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

export function useDeleteSessionItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      itemId,
    }: {
      sessionId: string;
      itemId: string;
    }) => {
      const token = await getToken();
      const response = await api(`/api/sessions/${sessionId}/items/${itemId}`, {
        method: "DELETE",
        token,
      });

      const result = (await response.json()) as ApiResponse<{
        id: string;
        deleted: true;
      }>;
      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.byId(variables.sessionId),
      });
    },
  });
}
