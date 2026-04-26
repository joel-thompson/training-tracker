import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";

const mockUseAuth = vi.fn();
const mockUseActiveGoals = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <a {...props}>{children}</a>,
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/goals/useActiveGoals", () => ({
  useActiveGoals: () => mockUseActiveGoals(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ userId: "user-1" });
    mockUseActiveGoals.mockReturnValue({ data: { goals: [] }, isLoading: false });
    window.localStorage.clear();
  });

  it("shows Log Session when there is no fresh draft", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "Log Session" })).toBeInTheDocument();
  });

  it("shows Resume Draft when a fresh draft exists", async () => {
    window.localStorage.setItem(
      "training-tracker:session-draft:user-1",
      JSON.stringify({
        savedAt: new Date().toISOString(),
        sessionDate: "2026-04-26",
        classType: "gi",
        sessionType: "class",
        techniqueCovered: "",
        generalNotes: "",
        successes: ["Kept frames inside"],
        problems: [""],
        questions: [""],
      })
    );

    renderPage();

    expect(await screen.findByRole("button", { name: "Resume Draft" })).toBeInTheDocument();
  });
});
