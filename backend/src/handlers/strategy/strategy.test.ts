import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  DeleteGameStrategyResponse,
  GameStrategy,
  GetGameStrategyResponse,
} from "shared/types";

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockLimit,
  mockInsert,
  mockValues,
  mockOnConflictDoUpdate,
  mockReturning,
  mockDelete,
  mockDeleteWhere,
} = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));

  const mockReturning = vi.fn();
  const mockOnConflictDoUpdate = vi.fn(() => ({ returning: mockReturning }));
  const mockValues = vi.fn(() => ({
    onConflictDoUpdate: mockOnConflictDoUpdate,
  }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));

  const mockDeleteWhere = vi.fn();
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));

  return {
    mockSelect,
    mockFrom,
    mockWhere,
    mockLimit,
    mockInsert,
    mockValues,
    mockOnConflictDoUpdate,
    mockReturning,
    mockDelete,
    mockDeleteWhere,
  };
});

vi.mock("../../db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    delete: mockDelete,
  },
}));

vi.mock("../../utils/auth", () => ({
  requireUserId: vi.fn(() => "user-123"),
}));

import {
  deleteGameStrategyHandler,
  getGameStrategyHandler,
  upsertGameStrategyHandler,
} from "./index";

const mockStrategyRow = {
  userId: "user-123",
  markdown: "# Strategy\n\nI prefer to get on top and stay on top.",
  createdAt: new Date("2026-04-20T00:00:00.000Z"),
  updatedAt: new Date("2026-04-21T00:00:00.000Z"),
};

describe("strategy handlers", () => {
  const app = new Hono();
  app.get("/strategy", getGameStrategyHandler);
  app.put("/strategy", upsertGameStrategyHandler);
  app.delete("/strategy", deleteGameStrategyHandler);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no strategy exists", async () => {
    mockLimit.mockResolvedValueOnce([]);

    const res = await app.fetch(new Request("http://localhost/strategy"));

    expect(res.status).toBe(200);
    const data =
      (await res.json()) as ApiSuccessResponse<GetGameStrategyResponse>;
    expect(data.data.strategy).toBeNull();
  });

  it("creates a strategy via PUT", async () => {
    mockReturning.mockResolvedValueOnce([mockStrategyRow]);

    const res = await app.fetch(
      new Request("http://localhost/strategy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: mockStrategyRow.markdown }),
      }),
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as ApiSuccessResponse<GameStrategy>;
    expect(data.data.markdown).toContain("stay on top");
    expect(mockOnConflictDoUpdate).toHaveBeenCalledOnce();
  });

  it("updates a strategy via PUT", async () => {
    mockReturning.mockResolvedValueOnce([
      {
        ...mockStrategyRow,
        markdown: "# Updated\n\nI prefer to attack kimuras.",
      },
    ]);

    const res = await app.fetch(
      new Request("http://localhost/strategy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: "# Updated\n\nI prefer to attack kimuras.",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as ApiSuccessResponse<GameStrategy>;
    expect(data.data.markdown).toContain("attack kimuras");
  });

  it("returns 404 on delete when the user's strategy does not exist", async () => {
    mockLimit.mockResolvedValueOnce([]);

    const res = await app.fetch(
      new Request("http://localhost/strategy", {
        method: "DELETE",
      }),
    );

    expect(res.status).toBe(404);
    const data = (await res.json()) as ApiErrorResponse;
    expect(data.error.code).toBe("NOT_FOUND");
  });

  it("deletes an existing strategy", async () => {
    mockLimit.mockResolvedValueOnce([mockStrategyRow]);
    mockDeleteWhere.mockResolvedValueOnce(undefined);

    const res = await app.fetch(
      new Request("http://localhost/strategy", {
        method: "DELETE",
      }),
    );

    expect(res.status).toBe(200);
    const data =
      (await res.json()) as ApiSuccessResponse<DeleteGameStrategyResponse>;
    expect(data.data.deleted).toBe(true);
  });

  it("keeps strategy reads scoped to the current user", async () => {
    mockLimit.mockResolvedValueOnce([]);

    const res = await app.fetch(new Request("http://localhost/strategy"));

    expect(res.status).toBe(200);
    const data =
      (await res.json()) as ApiSuccessResponse<GetGameStrategyResponse>;
    expect(data.data.strategy).toBeNull();
    expect(mockWhere).toHaveBeenCalledOnce();
  });
});
