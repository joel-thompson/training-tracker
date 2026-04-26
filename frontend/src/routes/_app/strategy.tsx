import { createFileRoute } from "@tanstack/react-router";
import { StrategyPage } from "@/components/strategy/StrategyPage";

export const Route = createFileRoute("/_app/strategy")({
  component: StrategyPage,
});
