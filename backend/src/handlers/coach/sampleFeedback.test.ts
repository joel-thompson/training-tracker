import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ApiErrorResponse, ApiSuccessResponse, SampleFeedbackResponse } from "shared/types";

const { mockRequireUserId, mockRequireAiAccess, mockGenerateSampleFeedback } = vi.hoisted(() => {
  const mockRequireUserId = vi.fn<() => string>(() => "test-user-id");
  const mockRequireAiAccess = vi.fn<(userId: string) => Promise<void>>();
  const mockGenerateSampleFeedback = vi.fn<
    (note: string) => Promise<SampleFeedbackResponse>
  >();

  return {
    mockRequireUserId,
    mockRequireAiAccess,
    mockGenerateSampleFeedback,
  };
});

vi.mock("../../utils/auth", () => ({
  requireUserId: mockRequireUserId,
  requireAiAccess: mockRequireAiAccess,
}));

vi.mock("../../coach/service", () => ({
  generateSampleFeedback: mockGenerateSampleFeedback,
}));

import { sampleFeedbackHandler } from "./sampleFeedback";

describe("sampleFeedbackHandler", () => {
  const app = new Hono();
  app.post("/sample-feedback", sampleFeedbackHandler);

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireUserId.mockReturnValue("test-user-id");
    mockRequireAiAccess.mockResolvedValue(undefined);
    mockGenerateSampleFeedback.mockResolvedValue({
      summary: "You are losing the knee shield before controlling distance.",
      nextStep: "Fight for inside frames before looking to attack.",
      drillIdeas: ["Knee shield retention rounds", "Underhook pummeling from half guard"],
    } satisfies SampleFeedbackResponse);
  });

  it("returns structured sample feedback for a valid request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/sample-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "I keep getting smashed from half guard." }),
      })
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as ApiSuccessResponse<SampleFeedbackResponse>;
    expect(data.success).toBe(true);
    expect(data.data.drillIdeas).toHaveLength(2);
    expect(mockRequireUserId).toHaveBeenCalled();
    expect(mockRequireAiAccess).toHaveBeenCalledWith("test-user-id");
    expect(mockGenerateSampleFeedback).toHaveBeenCalledWith(
      "I keep getting smashed from half guard."
    );
  });

  it("returns 400 for an invalid request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/sample-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "" }),
      })
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ApiErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(mockGenerateSampleFeedback).not.toHaveBeenCalled();
  });

  it("does not run inference when auth rejects the request", async () => {
    mockRequireUserId.mockImplementationOnce(() => {
      throw new HTTPException(401, {
        res: new Response(
          JSON.stringify({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Unauthorized" },
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        ),
      });
    });

    const res = await app.fetch(
      new Request("http://localhost/sample-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Half guard problem" }),
      })
    );

    expect(res.status).toBe(401);
    const data = (await res.json()) as ApiErrorResponse;
    expect(data.error.code).toBe("UNAUTHORIZED");
    expect(mockRequireAiAccess).not.toHaveBeenCalled();
    expect(mockGenerateSampleFeedback).not.toHaveBeenCalled();
  });
});
