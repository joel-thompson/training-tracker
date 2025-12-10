interface NewReviewPageProps {
  week?: string;
}

export function NewReviewPage({ week }: NewReviewPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Weekly Reflection</h1>
      <p className="text-muted-foreground text-lg">
        {week
          ? `Reflection for week ${week}`
          : "Create a new weekly reflection"}
      </p>
    </div>
  );
}
