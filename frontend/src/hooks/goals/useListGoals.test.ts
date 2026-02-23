import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ApiResponse, ListGoalsResponse } from "shared/types";
import { fetchListGoals } from "./useListGoals";

vi.mock("@/utils/api", () => ({
  api: vi.fn(),
}));

import { api } from "@/utils/api";

const mockApi = vi.mocked(api);

const mockListGoalsResponse: ListGoalsResponse = {
  goals: [
    {
      id: "goal-id-1",
      userId: "user-1",
      goalText: "Improve guard passing",
      category: "top",
      notes: null,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      completedAt: null,
    },
  ],
  pagination: {
    nextCursor: null,
    hasMore: false,
    total: 1,
  },
};

describe("fetchListGoals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the correct endpoint", async () => {
    const successResponse: ApiResponse<ListGoalsResponse> = {
      success: true,
      data: mockListGoalsResponse,
    };
    mockApi.mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        headers: { "Content-Type": "application/json" },
      })
    );

    await fetchListGoals({}, "test-token");

    expect(mockApi).toHaveBeenCalledWith("/api/v1/goals", { token: "test-token" });
  });

  it("returns parsed goal list on success", async () => {
    const successResponse: ApiResponse<ListGoalsResponse> = {
      success: true,
      data: mockListGoalsResponse,
    };
    mockApi.mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await fetchListGoals({}, "test-token");

    expect(result.goals).toHaveLength(1);
    expect(result.goals[0].goalText).toBe("Improve guard passing");
    expect(result.pagination.hasMore).toBe(false);
  });

  it("appends query params when provided", async () => {
    const successResponse: ApiResponse<ListGoalsResponse> = {
      success: true,
      data: mockListGoalsResponse,
    };
    mockApi.mockResolvedValue(
      new Response(JSON.stringify(successResponse), {
        headers: { "Content-Type": "application/json" },
      })
    );

    await fetchListGoals({ limit: 10, active: true }, "test-token");

    expect(mockApi).toHaveBeenCalledWith("/api/v1/goals?limit=10&active=true", {
      token: "test-token",
    });
  });

  it("throws when response indicates failure", async () => {
    const errorResponse: ApiResponse<ListGoalsResponse> = {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized" },
    };
    mockApi.mockResolvedValue(
      new Response(JSON.stringify(errorResponse), {
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(fetchListGoals({}, null)).rejects.toThrow("Unauthorized");
  });
});
