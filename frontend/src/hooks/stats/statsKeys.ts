export const statsKeys = {
  all: ["stats"] as const,
  streak: () => [...statsKeys.all, "streak"] as const,
  monthly: () => [...statsKeys.all, "monthly"] as const,
  classTypes: () => [...statsKeys.all, "classTypes"] as const,
  heatmap: () => [...statsKeys.all, "heatmap"] as const,
};

