import { format, parseISO } from "date-fns";
import { Edit, Trash2, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Goal } from "shared/types";

export function GoalCard({
  goal,
  onComplete,
  onEdit,
  onDelete,
  onReactivate,
}: {
  goal: Goal;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReactivate?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{goal.goalText}</CardTitle>
            {goal.notes && (
              <p className="text-muted-foreground text-sm mt-2">{goal.notes}</p>
            )}
            <p className="text-muted-foreground text-sm mt-1">
              Created {format(parseISO(goal.createdAt), "PPP")}
              {goal.completedAt &&
                ` • Completed ${format(parseISO(goal.completedAt), "PPP")}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {goal.isActive ? (
              <>
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onComplete}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                {onReactivate && (
                  <Button variant="ghost" size="icon" onClick={onReactivate}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
