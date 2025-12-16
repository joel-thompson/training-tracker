import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, Edit } from "lucide-react";
import { useListSessions } from "@/hooks/sessions/useListSessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "shared/types";

const CLASS_TYPE_LABELS: Record<string, string> = {
  gi: "Gi",
  nogi: "No-Gi",
  open_mat: "Open Mat",
  private: "Private",
  competition: "Competition",
  other: "Other",
};

function SessionCard({ session }: { session: Session }) {
  const [isOpen, setIsOpen] = useState(false);

  const itemsByType = {
    success: session.items?.filter((item) => item.type === "success") ?? [],
    problem: session.items?.filter((item) => item.type === "problem") ?? [],
    question: session.items?.filter((item) => item.type === "question") ?? [],
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {format(parseISO(session.sessionDate), "PPP")}
                </h3>
                <Badge variant="outline">
                  {CLASS_TYPE_LABELS[session.classType] || session.classType}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/sessions/$id/edit"
                  params={{ id: session.id }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center size-9">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {session.techniqueCovered && (
              <div>
                <h4 className="text-sm font-medium mb-2">Technique Covered</h4>
                <p className=" text-sm whitespace-pre-wrap">
                  {session.techniqueCovered}
                </p>
              </div>
            )}
            {(itemsByType.success.length > 0 ||
              itemsByType.problem.length > 0 ||
              itemsByType.question.length > 0) && (
              <div className="space-y-4">
                {itemsByType.success.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Things That Went Well
                    </h4>
                    <ul className="space-y-1">
                      {itemsByType.success.map((item) => (
                        <li key={item.id} className=" text-sm pl-4">
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {itemsByType.problem.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Things to Improve
                    </h4>
                    <ul className="space-y-1">
                      {itemsByType.problem.map((item) => (
                        <li key={item.id} className=" text-sm pl-4">
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {itemsByType.question.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Questions to Explore
                    </h4>
                    <ul className="space-y-1">
                      {itemsByType.question.map((item) => (
                        <li key={item.id} className=" text-sm pl-4">
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
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">
                  {session.generalNotes}
                </p>
              </div>
            )}
            {!session.techniqueCovered &&
              !session.generalNotes &&
              itemsByType.success.length === 0 &&
              itemsByType.problem.length === 0 &&
              itemsByType.question.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No additional details for this session.
                </p>
              )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function HistoryPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useListSessions({ excludeItems: false });

  const allSessions = data?.pages.flatMap((page) => page.sessions) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground text-lg">
          View all your training sessions
        </p>
      </div>

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
            <SessionCard key={session.id} session={session} />
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
