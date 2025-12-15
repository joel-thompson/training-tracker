import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

export function useDeleteSession() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      const response = await api(`/api/sessions/${id}`, {
        method: "DELETE",
        token,
      });

      const result = (await response.json()) as ApiResponse<{
        id: string;
        deletedAt: string;
      }>;
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
