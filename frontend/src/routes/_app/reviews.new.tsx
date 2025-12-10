import { createFileRoute } from "@tanstack/react-router";
import { NewReviewPage } from "@/components/reviews/NewReviewPage";

export const Route = createFileRoute("/_app/reviews/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    week: search.week as string | undefined,
  }),
  component: NewReviewPageWrapper,
});

function NewReviewPageWrapper() {
  const { week } = Route.useSearch();
  return <NewReviewPage week={week} />;
}
