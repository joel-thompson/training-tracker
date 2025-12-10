interface WeekPageProps {
  date?: string;
}

export function WeekPage({ date }: WeekPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Week View</h1>
      <p className="text-muted-foreground text-lg">
        Weekly training summary {date ? `for ${date}` : "for current week"}
      </p>
    </div>
  );
}
