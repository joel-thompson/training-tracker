import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { SessionDatesResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { sessionKeys } from "./sessionKeys";

async function fetchSessionDates(
  token: string | null
): Promise<SessionDatesResponse> {
  const response = await api("/api/v1/sessions/dates", { token });

  const result = (await response.json()) as ApiResponse<SessionDatesResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useSessionDates() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sessionKeys.dates(),
    queryFn: async () => {
      const token = await getToken();
      return fetchSessionDates(token);
    },
  });
}
