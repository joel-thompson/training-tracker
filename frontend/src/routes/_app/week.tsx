import { createFileRoute } from "@tanstack/react-router";
import { WeekPage } from "@/components/week/WeekPage";

export const Route = createFileRoute("/_app/week")({
  validateSearch: (search: Record<string, unknown>): { date?: string } => ({
    date: (search.date as string) || undefined,
  }),
  component: WeekPageWrapper,
});

function WeekPageWrapper() {
  const { date } = Route.useSearch();
  return <WeekPage date={date} />;
}
