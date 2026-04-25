import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import type { ApiErrorResponse } from "shared/types";

interface MockStreamResult {
  toTextStreamResponse: () => Response;
}

const { mockRequireUserId, mockRequireAiAccess, mockStreamCoachChat, mockToTextStreamResponse } =
  vi.hoisted(() => {
    const mockRequireUserId = vi.fn<() => string>(() => "test-user-id");
    const mockRequireAiAccess = vi.fn<(userId: string) => Promise<void>>();
    const mockToTextStreamResponse = vi.fn<() => Response>(
      () => new Response("streamed coach response")
    );
    const mockStreamCoachChat = vi.fn<
      (userId: string, messages: unknown[]) => Promise<MockStreamResult>
    >(() =>
      Promise.resolve({
        toTextStreamResponse: mockToTextStreamResponse,
      })
    );

    return {
      mockRequireUserId,
      mockRequireAiAccess,
      mockStreamCoachChat,
      mockToTextStreamResponse,
    };
  });

vi.mock("../../utils/auth", () => ({
  requireUserId: mockRequireUserId,
  requireAiAccess: mockRequireAiAccess,
}));

vi.mock("../../coach/service", () => ({
  streamCoachChat: mockStreamCoachChat,
}));

import { chatHandler } from "./chat";

describe("chatHandler", () => {
  const app = new Hono();
  app.post("/chat", chatHandler);

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireUserId.mockReturnValue("test-user-id");
    mockRequireAiAccess.mockResolvedValue(undefined);
    mockToTextStreamResponse.mockReturnValue(new Response("streamed coach response"));
    mockStreamCoachChat.mockResolvedValue({ toTextStreamResponse: mockToTextStreamResponse });
  });

  it("streams a coach response for a valid chat request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "What should I focus on?" }],
        }),
      })
    );

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("streamed coach response");
    expect(mockRequireUserId).toHaveBeenCalled();
    expect(mockRequireAiAccess).toHaveBeenCalledWith("test-user-id");
    expect(mockStreamCoachChat).toHaveBeenCalledWith("test-user-id", [
      { role: "user", content: "What should I focus on?" },
    ]);
    expect(mockToTextStreamResponse).toHaveBeenCalled();
  });

  it("returns 400 for an invalid chat request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [] }),
      })
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ApiErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(mockStreamCoachChat).not.toHaveBeenCalled();
  });
});
