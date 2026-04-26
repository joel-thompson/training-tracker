import { createFileRoute } from "@tanstack/react-router";
import { NewSessionPage } from "@/components/sessions/NewSessionPage";

export const Route = createFileRoute("/_app/sessions/new")({
  validateSearch: (search: Record<string, unknown>): { resumeDraft?: string } => ({
    resumeDraft: (search.resumeDraft as string) || undefined,
  }),
  component: NewSessionPageWrapper,
});

function NewSessionPageWrapper() {
  const { resumeDraft } = Route.useSearch();
  return <NewSessionPage resumeDraft={resumeDraft === "1"} />;
}
