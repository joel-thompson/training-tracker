import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import type { ApiSuccessResponse, ApiErrorResponse, Goal } from "shared/types";

const { mockReturning, mockInsert } = vi.hoisted(() => {
  const mockReturning = vi.fn();
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  return { mockReturning, mockInsert };
});

vi.mock("../../db", () => ({
  db: { insert: mockInsert },
}));

vi.mock("../../utils/auth", () => ({
  requireUserId: vi.fn(() => "test-user-id"),
}));

import { createGoalHandler } from "./create";

const mockGoal = {
  id: "goal-id-123",
  userId: "test-user-id",
  goalText: "Improve guard passing",
  category: "top" as const,
  notes: null,
  isActive: true,
  createdAt: new Date("2026-01-01"),
  completedAt: null,
};

describe("createGoalHandler", () => {
  const app = new Hono();
  app.post("/goals", createGoalHandler);

  beforeEach(() => {
    vi.clearAllMocks();
    mockReturning.mockResolvedValue([mockGoal]);
  });

  it("returns 201 with goal data for valid body", async () => {
    const res = await app.fetch(
      new Request("http://localhost/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalText: "Improve guard passing", category: "top" }),
      })
    );

    expect(res.status).toBe(201);
    const data = (await res.json()) as ApiSuccessResponse<Goal>;
    expect(data.success).toBe(true);
    expect(data.data.goalText).toBe("Improve guard passing");
    expect(data.data.userId).toBe("test-user-id");
  });

  it("returns 400 for empty goalText", async () => {
    const res = await app.fetch(
      new Request("http://localhost/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalText: "" }),
      })
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ApiErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid category", async () => {
    const res = await app.fetch(
      new Request("http://localhost/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalText: "test", category: "invalid" }),
      })
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ApiErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });
});
