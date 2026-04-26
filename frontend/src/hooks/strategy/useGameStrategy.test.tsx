import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type {
  ApiResponse,
  DeleteGameStrategyResponse,
  GameStrategy,
  GetGameStrategyResponse,
} from "shared/types";
import { fetchGameStrategy } from "./useGameStrategy";
import {
  deleteGameStrategy,
  useDeleteGameStrategy,
} from "./useDeleteGameStrategy";
import { saveGameStrategy, useSaveGameStrategy } from "./useSaveGameStrategy";

vi.mock("@/utils/api", () => ({
  api: vi.fn(),
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("test-token"),
  }),
}));

import { api } from "@/utils/api";

const mockApi = vi.mocked(api);

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const strategy: GameStrategy = {
  userId: "user-123",
  markdown: "# Strategy\n\nI prefer to attack the legs.",
  createdAt: "2026-04-20T00:00:00.000Z",
  updatedAt: "2026-04-21T00:00:00.000Z",
};

describe("strategy hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the strategy from the correct endpoint", async () => {
    const successResponse: ApiResponse<GetGameStrategyResponse> = {
      success: true,
      data: { strategy },
    };
    mockApi.mockResolvedValueOnce(
      new Response(JSON.stringify(successResponse)),
    );

    const result = await fetchGameStrategy("test-token");

    expect(mockApi).toHaveBeenCalledWith("/api/v1/strategy", {
      token: "test-token",
    });
    expect(result.strategy?.markdown).toContain("attack the legs");
  });

  it("saves the strategy with PUT", async () => {
    const successResponse: ApiResponse<GameStrategy> = {
      success: true,
      data: strategy,
    };
    mockApi.mockResolvedValueOnce(
      new Response(JSON.stringify(successResponse)),
    );

    const result = await saveGameStrategy(
      { markdown: strategy.markdown },
      "test-token",
    );

    expect(mockApi).toHaveBeenCalledWith("/api/v1/strategy", {
      method: "PUT",
      body: JSON.stringify({ markdown: strategy.markdown }),
      token: "test-token",
    });
    expect(result.userId).toBe("user-123");
  });

  it("deletes the strategy with DELETE", async () => {
    const successResponse: ApiResponse<DeleteGameStrategyResponse> = {
      success: true,
      data: { deleted: true },
    };
    mockApi.mockResolvedValueOnce(
      new Response(JSON.stringify(successResponse)),
    );

    const result = await deleteGameStrategy("test-token");

    expect(mockApi).toHaveBeenCalledWith("/api/v1/strategy", {
      method: "DELETE",
      token: "test-token",
    });
    expect(result.deleted).toBe(true);
  });

  it("invalidates the strategy query after save", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    mockApi.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: strategy,
        } satisfies ApiResponse<GameStrategy>),
      ),
    );

    const { result } = renderHook(() => useSaveGameStrategy(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ markdown: strategy.markdown });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["strategy", "detail"],
    });
  });

  it("invalidates the strategy query after delete", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    mockApi.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: { deleted: true },
        } satisfies ApiResponse<DeleteGameStrategyResponse>),
      ),
    );

    const { result } = renderHook(() => useDeleteGameStrategy(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["strategy", "detail"],
    });
  });
});
