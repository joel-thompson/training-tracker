import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { getEnvRequired } from "../utils/env";
import { getAiModelId, type AiFeature } from "./models";

let openaiProvider: ReturnType<typeof createOpenAI> | null = null;

function getOpenAIProvider(): ReturnType<typeof createOpenAI> {
  openaiProvider ??= createOpenAI({
    apiKey: getEnvRequired("OPENAI_API_KEY"),
  });

  return openaiProvider;
}

export function getAiModel(feature: AiFeature): LanguageModel {
  return getOpenAIProvider()(getAiModelId(feature));
}

