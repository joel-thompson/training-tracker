import { createFileRoute } from "@tanstack/react-router";
import { EditSessionPage } from "@/components/sessions/EditSessionPage";

export const Route = createFileRoute("/_app/sessions/$id/edit")({
  component: EditSessionPageWrapper,
});

function EditSessionPageWrapper() {
  const { id } = Route.useParams();
  return <EditSessionPage sessionId={id} />;
}
