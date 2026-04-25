import type { ModelMessage } from "ai";
import { sampleFeedbackResponseSchema } from "shared/validation";
import type { SampleFeedbackResponse } from "shared/types";
import { generateAiObject, streamAiText } from "../ai/run";
import { fetchTrainingContext } from "./context";
import { buildCoachSystemPrompt } from "./prompt";

export async function streamCoachChat(userId: string, messages: ModelMessage[]) {
  const context = await fetchTrainingContext(userId);
  const system = buildCoachSystemPrompt(context);

  return streamAiText({
    feature: "coachChat",
    system,
    messages,
  });
}

export async function generateSampleFeedback(note: string): Promise<SampleFeedbackResponse> {
  return generateAiObject({
    feature: "coachSampleFeedback",
    system:
      "You are a concise BJJ training coach. Return practical feedback for a training note.",
    prompt: `Training note:\n${note}`,
    schema: sampleFeedbackResponseSchema,
    name: "sampleFeedback",
    description: "Short BJJ coaching feedback for a training note.",
    maxOutputTokens: 500,
    temperature: 0.3,
  });
}

