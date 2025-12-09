import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">History</h1>
      <p className="text-muted-foreground text-lg">
        View all your training sessions
      </p>
    </div>
  );
}
