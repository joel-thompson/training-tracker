import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HistoryPage } from "./HistoryPage";

const mockNavigate = vi.fn();
const mockUseListSessions = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <a {...props}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock("@/hooks/sessions/useListSessions", () => ({
  useListSessions: (...args: unknown[]) => mockUseListSessions(...args),
}));

function renderPage(savedSessionId?: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <HistoryPage savedSessionId={savedSessionId} />
    </QueryClientProvider>
  );
}

describe("HistoryPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseListSessions.mockReturnValue({
      data: {
        pages: [
          {
            sessions: [
              {
                id: "session-1",
                userId: "user-1",
                sessionDate: "2026-04-26",
                classType: "gi",
                sessionType: "class",
                techniqueCovered: "Top half passing",
                generalNotes: null,
                createdAt: "2026-04-26T00:00:00.000Z",
                updatedAt: "2026-04-26T00:00:00.000Z",
                items: [
                  { id: "item-1", sessionId: "session-1", type: "success", content: "Won the underhook", order: 0, createdAt: "2026-04-26T00:00:00.000Z" },
                  { id: "item-2", sessionId: "session-1", type: "question", content: "Need a cleaner finish from mount", order: 1, createdAt: "2026-04-26T00:00:00.000Z" },
                ],
              },
            ],
            pagination: { nextCursor: null, hasMore: false, total: 1 },
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    });
    Element.prototype.scrollIntoView = vi.fn();
    globalThis.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  it("shows the saved-session banner, expands the saved card, and clears the search state", async () => {
    renderPage("session-1");

    expect(screen.getByText("Session logged.")).toBeInTheDocument();
    expect(screen.getByText("Review next: Need a cleaner finish from mount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Collapse April 26th, 2026/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/history", search: {}, replace: true });
    });
  });

  it("prefixes collapsed previews by source", () => {
    renderPage();

    expect(screen.getByText("Clicked: Won the underhook")).toBeInTheDocument();
  });
});
