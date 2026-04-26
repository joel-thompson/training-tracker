import { Hono } from "hono";
import {
  deleteGameStrategyHandler,
  getGameStrategyHandler,
  upsertGameStrategyHandler,
} from "../handlers/strategy";

const strategy = new Hono();

strategy.get("/", getGameStrategyHandler);
strategy.put("/", upsertGameStrategyHandler);
strategy.delete("/", deleteGameStrategyHandler);

export { strategy };
