import type { Context } from "hono";
import { requireUserId, requireAiAccess } from "../../utils/auth";
import { errorResponse, ErrorCodes } from "../../utils/response";
import { chatRequestSchema } from "shared/validation";
import { streamCoachChat } from "../../coach/service";

export const chatHandler = async (c: Context) => {
  const userId = requireUserId(c);
  await requireAiAccess(userId);

  const body: unknown = await c.req.json();
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message), 400);
  }

  const result = await streamCoachChat(userId, parsed.data.messages);

  // Return streaming response compatible with useChat hook
  return result.toTextStreamResponse();
};
