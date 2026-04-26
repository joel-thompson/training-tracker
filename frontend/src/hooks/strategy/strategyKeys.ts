export const strategyKeys = {
  all: ["strategy"] as const,
  detail: () => [...strategyKeys.all, "detail"] as const,
};
