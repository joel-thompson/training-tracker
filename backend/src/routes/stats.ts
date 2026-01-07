import { Hono } from "hono";
import {
  getStreakHandler,
  getMonthlySessionsHandler,
  getClassTypeSplitHandler,
  getHeatmapHandler,
} from "../handlers/stats";

const stats = new Hono();

stats.get("/streak", getStreakHandler);
stats.get("/monthly", getMonthlySessionsHandler);
stats.get("/class-types", getClassTypeSplitHandler);
stats.get("/heatmap", getHeatmapHandler);

export { stats };

