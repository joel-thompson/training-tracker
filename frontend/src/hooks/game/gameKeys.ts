export const gameKeys = {
  all: ["game"] as const,

  // Invalidation keys (broad)
  allItems: () => [...gameKeys.all, "items"] as const,
  allTransitions: () => [...gameKeys.all, "transitions"] as const,

  // Query keys (specific)
  items: () => [...gameKeys.allItems()] as const,
  transitions: () => [...gameKeys.allTransitions()] as const,
};
