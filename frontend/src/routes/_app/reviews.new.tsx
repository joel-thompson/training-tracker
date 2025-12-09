import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/reviews/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    week: search.week as string | undefined,
  }),
  component: NewReviewPage,
});

function NewReviewPage() {
  const { week } = Route.useSearch();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Weekly Reflection</h1>
      <p className="text-muted-foreground text-lg">
        {week ? `Reflection for week ${week}` : "Create a new weekly reflection"}
      </p>
    </div>
  );
}
