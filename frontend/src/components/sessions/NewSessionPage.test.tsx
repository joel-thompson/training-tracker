import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewSessionPage } from "./NewSessionPage";

const mockNavigate = vi.fn();
const mockMutate = vi.fn();
const mockUseAuth = vi.fn();
const mockUseActiveGoals = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  useNavigate: () => mockNavigate,
  useBlocker: vi.fn(),
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/sessions/useCreateSession", () => ({
  useCreateSession: () => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/hooks/goals/useActiveGoals", () => ({
  useActiveGoals: () => mockUseActiveGoals(),
}));

function renderPage(props?: React.ComponentProps<typeof NewSessionPage>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NewSessionPage {...props} />
    </QueryClientProvider>
  );
}

describe("NewSessionPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockMutate.mockReset();
    mockUseAuth.mockReturnValue({ userId: "user-1" });
    mockUseActiveGoals.mockReturnValue({ data: { goals: [] }, isLoading: false });
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("restores a saved draft when the user confirms", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    window.localStorage.setItem(
      "training-tracker:session-draft:user-1",
      JSON.stringify({
        savedAt: new Date().toISOString(),
        sessionDate: "2026-04-26",
        classType: "nogi",
        sessionType: "sparring",
        techniqueCovered: "Top half passing",
        generalNotes: "",
        successes: ["Won the underhook battle"],
        problems: [""],
        questions: ["Need a better finish from mount"],
      })
    );

    renderPage();

    expect(await screen.findByText("Restored your unfinished session draft.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Won the underhook battle")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Need a better finish from mount")).toBeInTheDocument();
    expect(screen.getByText("Top half passing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No-Gi" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Sparring/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("restores a draft immediately from the resume link without prompting", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    window.localStorage.setItem(
      "training-tracker:session-draft:user-1",
      JSON.stringify({
        savedAt: new Date().toISOString(),
        sessionDate: "2026-04-26",
        classType: "gi",
        sessionType: "class",
        techniqueCovered: "",
        generalNotes: "",
        successes: ["Timed knee-cut entries better"],
        problems: [""],
        questions: [""],
      })
    );

    renderPage({ resumeDraft: true });

    expect(await screen.findByText("Restored your unfinished session draft.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Timed knee-cut entries better")).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("confirms before downgrading a detailed log to attendance-only", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    renderPage();

    await user.type(
      screen.getByRole("textbox", { name: "What Clicked Today? 1" }),
      "Stayed disciplined on posture breaks"
    );
    await user.click(screen.getAllByRole("button", { name: "Attendance Only" })[0]);

    expect(confirmSpy).toHaveBeenCalledWith(
      "Save this as attendance only and discard the details you entered?"
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("focuses the first quick-capture input after draft checks complete", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "What Clicked Today? 1" })).toHaveFocus();
    });
  });
});
