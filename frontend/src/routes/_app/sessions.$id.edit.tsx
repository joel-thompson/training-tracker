import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sessions/$id/edit")({
  component: EditSessionPage,
});

function EditSessionPage() {
  const { id } = Route.useParams();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Session</h1>
      <p className="text-muted-foreground text-lg">
        Edit session {id}
      </p>
    </div>
  );
}
