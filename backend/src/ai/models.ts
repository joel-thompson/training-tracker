export type AiFeature = "coachChat" | "coachSampleFeedback";

const aiFeatureModels = {
  coachChat: "gpt-4o-mini",
  coachSampleFeedback: "gpt-4o-mini",
} satisfies Record<AiFeature, string>;

export function getAiModelId(feature: AiFeature): string {
  return aiFeatureModels[feature];
}

