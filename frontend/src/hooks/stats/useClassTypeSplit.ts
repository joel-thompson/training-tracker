import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { ClassTypeSplitResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { statsKeys } from "./statsKeys";

async function fetchClassTypeSplit(
  token: string | null
): Promise<ClassTypeSplitResponse> {
  const response = await api("/api/v1/stats/class-types", { token });

  const result = (await response.json()) as ApiResponse<ClassTypeSplitResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useClassTypeSplit() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: statsKeys.classTypes(),
    queryFn: async () => {
      const token = await getToken();
      return fetchClassTypeSplit(token);
    },
  });
}

