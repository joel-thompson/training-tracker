import { z } from "zod";
import { GAME_STRATEGY_MAX_LENGTH } from "../constants/strategy";

export const upsertGameStrategySchema = z.object({
  markdown: z
    .string()
    .max(GAME_STRATEGY_MAX_LENGTH)
    .refine((value) => value.trim().length > 0, {
      message: "Markdown is required",
    }),
});
