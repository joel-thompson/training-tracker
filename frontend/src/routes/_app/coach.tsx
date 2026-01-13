import { createFileRoute } from "@tanstack/react-router";
import { CoachPage } from "@/components/coach/CoachPage";

export const Route = createFileRoute("/_app/coach")({
  component: CoachPage,
});
