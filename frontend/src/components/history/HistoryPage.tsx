import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, Edit } from "lucide-react";
import { useListSessions } from "@/hooks/sessions/useListSessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CLASS_TYPE_LABELS, SESSION_TYPE_LABELS } from "shared/constants";
import type { Session } from "shared/types";

interface HistoryPageProps {
  savedSessionId?: string;
}

function getSessionPreview(session: Session): string {
  const firstSuccess = session.items?.find(
    (item) => item.type === "success" && item.content.trim().length > 0
  );
  if (firstSuccess) {
    return `Clicked: ${firstSuccess.content}`;
  }

  if (session.techniqueCovered?.trim()) {
    return `Focus: ${session.techniqueCovered.trim()}`;
  }

  const firstProblem = session.items?.find(
    (item) => item.type === "problem" && item.content.trim().length > 0
  );
  if (firstProblem) {
    return `Stuck: ${firstProblem.content}`;
  }

  const firstQuestion = session.items?.find(
    (item) => item.type === "question" && item.content.trim().length > 0
  );
  if (firstQuestion) {
    return `Review: ${firstQuestion.content}`;
  }

  if (session.generalNotes?.trim()) {
    return `Note: ${session.generalNotes.trim()}`;
  }

  return "Attendance only";
}

function getSavedRecap(session: Session) {
  const firstSuccess = session.items?.find(
    (item) => item.type === "success" && item.content.trim().length > 0
  );
  const firstQuestion = session.items?.find(
    (item) => item.type === "question" && item.content.trim().length > 0
  );

  if (!firstSuccess && !session.techniqueCovered?.trim() && !firstQuestion) {
    return [`Attendance recorded for ${format(parseISO(session.sessionDate), "PPP")}.`];
  }

  const lines: string[] = [];
  if (firstSuccess) {
    lines.push(`Clicked: ${firstSuccess.content}`);
  } else if (session.techniqueCovered?.trim()) {
    lines.push(`Focus: ${session.techniqueCovered.trim()}`);
  }

  if (firstQuestion) {
    lines.push(`Review next: ${firstQuestion.content}`);
  }

  return lines;
}

function SessionCard({
  session,
  forceOpen = false,
  highlighted = false,
}: {
  session: Session;
  forceOpen?: boolean;
  highlighted?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(forceOpen);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const itemsByType = {
    success: session.items?.filter((item) => item.type === "success") ?? [],
    problem: session.items?.filter((item) => item.type === "problem") ?? [],
    question: session.items?.filter((item) => item.type === "question") ?? [],
  };

  const sessionLabel = format(parseISO(session.sessionDate), "PPP");
  const preview = getSessionPreview(session);

  return (
    <Card
      id={`session-card-${session.id}`}
      className={highlighted ? "border-primary shadow-lg shadow-primary/10" : undefined}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex min-w-0 flex-1 items-start justify-between gap-3 rounded-lg text-left"
                aria-label={isOpen ? `Collapse ${sessionLabel}` : `Expand ${sessionLabel}`}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{sessionLabel}</h3>
                    <Badge>{SESSION_TYPE_LABELS[session.sessionType]}</Badge>
                    <Badge variant="outline">{CLASS_TYPE_LABELS[session.classType]}</Badge>
                  </div>
                  <p className="text-muted-foreground max-w-2xl text-sm">{preview}</p>
                </div>
                <span className="flex items-center justify-center size-9" aria-hidden="true">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <Link
                to="/sessions/$id/edit"
                params={{ id: session.id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit session from ${sessionLabel}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {session.techniqueCovered && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Main Position / Technique</h4>
                <p className="text-sm whitespace-pre-wrap">{session.techniqueCovered}</p>
              </div>
            )}
            {(itemsByType.success.length > 0 ||
              itemsByType.problem.length > 0 ||
              itemsByType.question.length > 0) && (
              <div className="space-y-4">
                {itemsByType.success.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">What Clicked</h4>
                    <ul className="space-y-1">
                      {itemsByType.success.map((item) => (
                        <li key={item.id} className="text-sm pl-4">
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {itemsByType.problem.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Where You Got Stuck</h4>
                    <ul className="space-y-1">
                      {itemsByType.problem.map((item) => (
                        <li key={item.id} className="text-sm pl-4">
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {itemsByType.question.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">What To Review Next</h4>
                    <ul className="space-y-1">
                      {itemsByType.question.map((item) => (
                        <li key={item.id} className="text-sm pl-4">
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {session.generalNotes && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Extra Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{session.generalNotes}</p>
              </div>
            )}
            {!session.techniqueCovered &&
              !session.generalNotes &&
              itemsByType.success.length === 0 &&
              itemsByType.problem.length === 0 &&
              itemsByType.question.length === 0 && (
                <p className="text-muted-foreground text-sm">Attendance only.</p>
              )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function HistoryPage({ savedSessionId }: HistoryPageProps) {
  const navigate = useNavigate();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useListSessions({
    excludeItems: false,
  });
  const [highlightedSessionId, setHighlightedSessionId] = useState(savedSessionId);
  const [showSavedBanner, setShowSavedBanner] = useState(Boolean(savedSessionId));

  const allSessions = useMemo(() => data?.pages.flatMap((page) => page.sessions) ?? [], [data]);
  const savedSession = useMemo(
    () => allSessions.find((session) => session.id === savedSessionId),
    [allSessions, savedSessionId]
  );

  useEffect(() => {
    setHighlightedSessionId(savedSessionId);
    setShowSavedBanner(Boolean(savedSessionId));
  }, [savedSessionId]);

  useEffect(() => {
    if (!savedSessionId || !allSessions.some((session) => session.id === savedSessionId)) {
      return;
    }

    requestAnimationFrame(() => {
      document
        .getElementById(`session-card-${savedSessionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    void navigate({ to: "/history", search: {}, replace: true });
  }, [allSessions, navigate, savedSessionId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground text-lg">Review recent sessions and what stood out.</p>
      </div>

      {showSavedBanner && (
        <Card className="border-primary/20 bg-primary/5" aria-live="polite">
          <CardContent className="flex items-start justify-between gap-3 pt-6">
            <div className="space-y-2">
              <div>
                <p className="font-medium">Session logged.</p>
                <p className="text-muted-foreground text-sm">
                  Your newest entry is highlighted below so you can review it right away.
                </p>
              </div>
              {savedSession && (
                <div className="space-y-1 rounded-2xl border border-primary/15 bg-background/80 px-4 py-3">
                  {getSavedRecap(savedSession).map((line) => (
                    <p key={line} className="text-sm">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSavedBanner(false)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && allSessions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No sessions yet.{" "}
              <Link to="/sessions/new" className="text-primary underline">
                Create your first session
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && allSessions.length > 0 && (
        <div className="space-y-4">
          {allSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              forceOpen={session.id === highlightedSessionId}
              highlighted={session.id === highlightedSessionId}
            />
          ))}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => {
                  void fetchNextPage();
                }}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
