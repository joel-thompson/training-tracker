import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/welcome")({
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>Welcome to your BJJ training tracker!</p>
    </div>
  );
}
