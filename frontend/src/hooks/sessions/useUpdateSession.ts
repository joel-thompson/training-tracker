import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session, UpdateSessionInput, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

async function updateSession(
  id: string,
  input: UpdateSessionInput,
  token: string | null
): Promise<Session> {
  const response = await api(`/api/v1/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    token,
  });

  const result = (await response.json()) as ApiResponse<Session>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useUpdateSession() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSessionInput;
    }) => {
      const token = await getToken();
      return updateSession(id, input, token);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.byId(data.id),
      });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.allLists() });
    },
  });
}
