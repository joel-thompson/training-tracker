// GET /stats/streak - Weekly training streak
export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
}

// GET /stats/monthly - Sessions per month
export interface MonthlySessionsResponse {
  thisMonth: number;
  lastMonth: number;
}

// GET /stats/class-types - Gi vs No-Gi breakdown
export interface ClassTypeSplitResponse {
  gi: number;
  nogi: number;
  total: number;
}

// GET /stats/heatmap - Activity data for heatmap
export interface HeatmapActivity {
  date: string;
  count: number;
}

export interface HeatmapResponse {
  activity: HeatmapActivity[];
}

