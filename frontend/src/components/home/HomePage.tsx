import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveGoals } from "@/hooks/goals/useActiveGoals";

export function HomePage() {
  const { data: activeGoalsData, isLoading: activeGoalsLoading } =
    useActiveGoals();

  const activeGoals = activeGoalsData?.goals ?? [];

  return (
    <div className="space-y-6">
      {activeGoalsLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
        </Card>
      )}

      {!activeGoalsLoading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Current Goals
              </CardTitle>
              <Link to="/goals">
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  No active goals.{" "}
                  <Link to="/goals" className="text-primary underline">
                    Create your first goal
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="text-sm p-3 rounded-md bg-muted/50"
                  >
                    {goal.goalText}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Track your BJJ training sessions and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link to="/sessions/new">
            <Button className="w-full" size="lg">
              New Session
            </Button>
          </Link>
          <Link to="/history">
            <Button className="w-full" size="lg" variant="outline">
              View History
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
