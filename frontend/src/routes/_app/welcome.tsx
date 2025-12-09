import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/welcome")({
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="text-muted-foreground text-lg">
        Welcome to your BJJ training tracker!
      </p>
    </div>
  );
}
