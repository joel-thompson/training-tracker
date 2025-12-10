import { createFileRoute } from "@tanstack/react-router";
import { NewSessionPage } from "@/components/sessions/NewSessionPage";

export const Route = createFileRoute("/_app/sessions/new")({
  component: NewSessionPage,
});
