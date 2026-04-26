import type { z } from "zod";
import type { upsertGameStrategySchema } from "../validation/strategy";

export type UpsertGameStrategyInput = z.infer<typeof upsertGameStrategySchema>;

export interface GameStrategy {
  userId: string;
  markdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetGameStrategyResponse {
  strategy: GameStrategy | null;
}

export interface DeleteGameStrategyResponse {
  deleted: true;
}
