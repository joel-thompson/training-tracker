interface EditSessionPageProps {
  sessionId: string;
}

export function EditSessionPage({ sessionId }: EditSessionPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Session</h1>
      <p className="text-muted-foreground text-lg">Edit session {sessionId}</p>
    </div>
  );
}
