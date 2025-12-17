import { createFileRoute } from "@tanstack/react-router";
import { GamePage } from "@/components/game/GamePage";

export const Route = createFileRoute("/_app/game")({
  component: GamePage,
});
