import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { Session, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

async function fetchSession(
  id: string,
  token: string | null
): Promise<Session> {
  const response = await api(`/api/v1/sessions/${id}`, { token });

  const result = (await response.json()) as ApiResponse<Session>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useSession(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sessionKeys.byId(id),
    queryFn: async () => {
      const token = await getToken();
      return fetchSession(id, token);
    },
    enabled: !!id,
  });
}
