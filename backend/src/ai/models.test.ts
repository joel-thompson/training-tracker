import { describe, expect, it } from "vitest";
import { getAiModelId, type AiFeature } from "./models";

describe("getAiModelId", () => {
  it("returns explicit model ids for AI features", () => {
    const features: AiFeature[] = ["coachChat", "coachSampleFeedback"];

    for (const feature of features) {
      expect(getAiModelId(feature)).toBe("gpt-4o-mini");
    }
  });
});

