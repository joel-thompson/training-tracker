import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sessions/new")({
  component: NewSessionPage,
});

function NewSessionPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">New Session</h1>
      <p className="text-muted-foreground text-lg">
        Log a new training session
      </p>
    </div>
  );
}
