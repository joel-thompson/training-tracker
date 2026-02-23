import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GoalCard } from "./GoalCard";
import { GOAL_CATEGORY_LABELS, GOAL_CATEGORY_ORDER } from "shared/constants";
import type { Goal } from "shared/types";

export function ActiveGoalsSection({
  isLoading,
  goals,
  onComplete,
  onEdit,
  onDelete,
  onCreateGoal,
}: {
  isLoading: boolean;
  goals: Goal[];
  onComplete: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onCreateGoal: () => void;
}) {
  const groupedActiveGoals = GOAL_CATEGORY_ORDER.map((category) => ({
    category,
    goals: goals.filter((goal) => goal.category === category),
  })).filter((group) => group.goals.length > 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && goals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No active goals.{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={onCreateGoal}
              >
                Create your first goal
              </Button>
              .
            </p>
          </CardContent>
        </Card>
      )}
      {!isLoading && goals.length > 0 && (
        <div className="space-y-6">
          {groupedActiveGoals.map((group) => (
            <div key={group.category ?? "uncategorized"} className="space-y-4">
              <h3 className="text-lg font-semibold">
                {group.category
                  ? GOAL_CATEGORY_LABELS[group.category]
                  : "Uncategorized"}
              </h3>
              {group.goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onComplete={() => onComplete(goal)}
                  onEdit={() => onEdit(goal)}
                  onDelete={() => onDelete(goal)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
