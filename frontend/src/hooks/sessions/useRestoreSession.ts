import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, RestoreSessionResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

export function useRestoreSession() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      const response = await api(`/api/v1/sessions/${id}/restore`, {
        method: "POST",
        token,
      });

      const result =
        (await response.json()) as ApiResponse<RestoreSessionResponse>;
      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
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
