import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/components/history/HistoryPage";

export const Route = createFileRoute("/_app/history")({
  validateSearch: (search: Record<string, unknown>): { savedSessionId?: string } => ({
    savedSessionId: (search.savedSessionId as string) || undefined,
  }),
  component: HistoryPageWrapper,
});

function HistoryPageWrapper() {
  const { savedSessionId } = Route.useSearch();
  return <HistoryPage savedSessionId={savedSessionId} />;
}
