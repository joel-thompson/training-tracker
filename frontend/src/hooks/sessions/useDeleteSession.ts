import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, DeleteSessionResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

async function deleteSession(
  id: string,
  token: string | null
): Promise<DeleteSessionResponse> {
  const response = await api(`/api/v1/sessions/${id}`, {
    method: "DELETE",
    token,
  });

  const result = (await response.json()) as ApiResponse<DeleteSessionResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useDeleteSession() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteSession(id, token);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.allLists() });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.dates() });
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.byId(data.id),
      });
    },
  });
}
