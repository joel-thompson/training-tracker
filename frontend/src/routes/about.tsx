import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      <p>This is a marketing page example. No authentication required.</p>
    </div>
  );
}
