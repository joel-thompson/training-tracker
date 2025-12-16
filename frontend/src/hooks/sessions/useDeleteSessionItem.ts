import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, DeleteItemResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

async function deleteSessionItem(
  sessionId: string,
  itemId: string,
  token: string | null
): Promise<DeleteItemResponse> {
  const response = await api(`/api/v1/sessions/${sessionId}/items/${itemId}`, {
    method: "DELETE",
    token,
  });

  const result = (await response.json()) as ApiResponse<DeleteItemResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

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
      return deleteSessionItem(sessionId, itemId, token);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.byId(variables.sessionId),
      });
    },
  });
}
