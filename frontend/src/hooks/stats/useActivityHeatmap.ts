import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { HeatmapResponse, ApiResponse } from "shared/types";
import { api } from "@/utils/api";
import { statsKeys } from "./statsKeys";

async function fetchHeatmap(token: string | null): Promise<HeatmapResponse> {
  const response = await api("/api/v1/stats/heatmap", { token });

  const result = (await response.json()) as ApiResponse<HeatmapResponse>;
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function useActivityHeatmap() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: statsKeys.heatmap(),
    queryFn: async () => {
      const token = await getToken();
      return fetchHeatmap(token);
    },
  });
}

