import { generateText, Output, streamText, type ModelMessage } from "ai";
import type { z } from "zod";
import { getAiModel } from "./client";
import type { AiFeature } from "./models";

interface AiCallOptions {
  feature: AiFeature;
  system?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export function streamAiText({
  feature,
  system,
  messages,
  maxOutputTokens,
  temperature,
}: AiCallOptions & { messages: ModelMessage[] }) {
  return streamText({
    model: getAiModel(feature),
    system,
    messages,
    maxOutputTokens,
    temperature,
  });
}

export async function generateAiText({
  feature,
  system,
  prompt,
  maxOutputTokens,
  temperature,
}: AiCallOptions & { prompt: string }): Promise<string> {
  const result = await generateText({
    model: getAiModel(feature),
    system,
    prompt,
    maxOutputTokens,
    temperature,
  });

  return result.text;
}

export async function generateAiObject<T>({
  feature,
  system,
  prompt,
  schema,
  name,
  description,
  maxOutputTokens,
  temperature,
}: AiCallOptions & {
  prompt: string;
  schema: z.ZodType<T>;
  name?: string;
  description?: string;
}): Promise<T> {
  const result = await generateText({
    model: getAiModel(feature),
    system,
    prompt,
    output: Output.object({ schema, name, description }),
    maxOutputTokens,
    temperature,
  });

  return result.output;
}

