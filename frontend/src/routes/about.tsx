import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-muted-foreground text-lg">
          This is a marketing page example. No authentication required.
        </p>
      </div>
    </div>
  );
}
