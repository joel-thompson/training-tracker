import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalCard } from "./GoalCard";
import type { Goal } from "shared/types";

export function CompletedGoalsSection({
  isLoading,
  goals,
  isOpen,
  onOpenChange,
  onReactivate,
  onDelete,
}: {
  isLoading: boolean;
  goals: Goal[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReactivate: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto mb-4"
          >
            <h2 className="text-xl font-semibold">Completed Goals</h2>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
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
          {!isLoading && (
            <div className="space-y-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onComplete={() => {
                    // Completed goals don't need complete action
                  }}
                  onEdit={() => {
                    // Completed goals can't be edited
                  }}
                  onDelete={() => onDelete(goal)}
                  onReactivate={() => onReactivate(goal)}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
