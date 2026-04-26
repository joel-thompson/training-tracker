import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrategyPage } from "./StrategyPage";

vi.mock("@uiw/react-codemirror", () => ({
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      aria-label="Strategy editor"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const useGameStrategyMock = vi.fn();
const saveMutateAsyncMock = vi.fn();
const deleteMutateAsyncMock = vi.fn();

vi.mock("@/hooks/strategy/useGameStrategy", () => ({
  useGameStrategy: () => useGameStrategyMock(),
}));

vi.mock("@/hooks/strategy/useSaveGameStrategy", () => ({
  useSaveGameStrategy: () => ({
    mutateAsync: saveMutateAsyncMock,
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/hooks/strategy/useDeleteGameStrategy", () => ({
  useDeleteGameStrategy: () => ({
    mutateAsync: deleteMutateAsyncMock,
    isPending: false,
    error: null,
  }),
}));

describe("StrategyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStrategyMock.mockReturnValue({
      data: { strategy: null },
      isLoading: false,
      isError: false,
      error: null,
    });
    saveMutateAsyncMock.mockImplementation(
      async ({ markdown }: { markdown: string }) => ({
        userId: "user-123",
        markdown,
        createdAt: "2026-04-20T00:00:00.000Z",
        updatedAt: "2026-04-21T00:00:00.000Z",
      }),
    );
    deleteMutateAsyncMock.mockResolvedValue({ deleted: true });
  });

  it("renders the initial empty state", () => {
    render(<StrategyPage />);

    expect(screen.getByText("Strategy")).toBeInTheDocument();
    expect(
      screen.getByText(/Start with broad preferences first/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("supports editing, preview, and save gating", async () => {
    const user = userEvent.setup();
    render(<StrategyPage />);

    const editor = screen.getByLabelText("Strategy editor");
    await user.type(
      editor,
      "# Strategy{enter}{enter}I prefer to attack the legs.",
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    expect(
      screen.getByText("I prefer to attack the legs."),
    ).toBeInTheDocument();
  });

  it("loads existing markdown without losing it", () => {
    useGameStrategyMock.mockReturnValue({
      data: {
        strategy: {
          userId: "user-123",
          markdown: "## Top game\n\nI prefer body lock passing.",
          createdAt: "2026-04-20T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<StrategyPage />);

    expect(screen.getByLabelText("Strategy editor")).toHaveValue(
      "## Top game\n\nI prefer body lock passing.",
    );
    expect(screen.getByText("I prefer body lock passing.")).toBeInTheDocument();
  });

  it("clears back to the empty state after delete", async () => {
    const user = userEvent.setup();
    useGameStrategyMock.mockReturnValue({
      data: {
        strategy: {
          userId: "user-123",
          markdown: "## Top game\n\nI prefer body lock passing.",
          createdAt: "2026-04-20T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<StrategyPage />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Strategy editor")).toHaveValue("");
    });
  });
});
