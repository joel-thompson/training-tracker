import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateItemInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

export function useUpdateSessionItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      itemId,
      input,
    }: {
      sessionId: string;
      itemId: string;
      input: UpdateItemInput;
    }) => {
      const token = await getToken();
      const response = await api(`/api/sessions/${sessionId}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
        token,
      });

      const result = (await response.json()) as ApiResponse<{
        id: string;
        sessionId: string;
        type: "success" | "problem" | "question";
        content: string;
        order: number;
        createdAt: string;
      }>;
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
