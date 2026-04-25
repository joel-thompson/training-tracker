import type { Context } from "hono";
import { sampleFeedbackRequestSchema } from "shared/validation";
import type { SampleFeedbackResponse } from "shared/types";
import { generateSampleFeedback } from "../../coach/service";
import { requireAiAccess, requireUserId } from "../../utils/auth";
import { errorResponse, ErrorCodes, successResponse } from "../../utils/response";

export const sampleFeedbackHandler = async (c: Context) => {
  const userId = requireUserId(c);
  await requireAiAccess(userId);

  const body: unknown = await c.req.json();
  const parsed = sampleFeedbackRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message), 400);
  }

  const responseData: SampleFeedbackResponse = await generateSampleFeedback(parsed.data.note);

  return c.json(successResponse(responseData));
};
