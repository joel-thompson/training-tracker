import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/week")({
  validateSearch: (search: Record<string, unknown>): { date?: string } => ({
    date: (search.date as string) || undefined,
  }),
  component: WeekPage,
});

function WeekPage() {
  const { date } = Route.useSearch();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Week View</h1>
      <p className="text-muted-foreground text-lg">
        Weekly training summary {date ? `for ${date}` : "for current week"}
      </p>
    </div>
  );
}

