import { createFileRoute } from "@tanstack/react-router";
import { WelcomePage } from "@/components/welcome/WelcomePage";

export const Route = createFileRoute("/_app/welcome")({
  component: WelcomePage,
});
