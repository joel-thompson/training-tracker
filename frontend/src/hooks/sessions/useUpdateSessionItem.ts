import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateItemInput, ApiResponse, SessionItem } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

async function updateSessionItem(
  sessionId: string,
  itemId: string,
  input: UpdateItemInput,
  token: string | null
): Promise<SessionItem> {
  const response = await api(`/api/v1/sessions/${sessionId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<SessionItem>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

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
      return updateSessionItem(sessionId, itemId, input, token);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.byId(data.sessionId),
      });
    },
  });
}
