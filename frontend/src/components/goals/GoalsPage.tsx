import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useActiveGoals } from "@/hooks/goals/useActiveGoals";
import { useListGoals } from "@/hooks/goals/useListGoals";
import { useCreateGoal } from "@/hooks/goals/useCreateGoal";
import { useUpdateGoal } from "@/hooks/goals/useUpdateGoal";
import { useCompleteGoal } from "@/hooks/goals/useCompleteGoal";
import { useReactivateGoal } from "@/hooks/goals/useReactivateGoal";
import { useDeleteGoal } from "@/hooks/goals/useDeleteGoal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Goal } from "shared/types";

function GoalFormDialog({
  open,
  onOpenChange,
  goal,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
  onSubmit: (goalText: string) => void;
  isSubmitting: boolean;
}) {
  const [goalText, setGoalText] = useState(goal?.goalText ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalText.trim().length > 0 && goalText.trim().length <= 500) {
      onSubmit(goalText.trim());
    }
  };

  const remainingChars = 500 - goalText.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{goal ? "Edit Goal" : "New Goal"}</DialogTitle>
            <DialogDescription>
              {goal
                ? "Update your training goal"
                : "Set a new training goal to focus on"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalText">Goal</Label>
              <Textarea
                id="goalText"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="e.g., Improve butterfly guard, Better pressure passing..."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-muted-foreground text-xs text-right">
                {remainingChars} characters remaining
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || goalText.trim().length === 0}
            >
              {isSubmitting ? "Saving..." : goal ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GoalCard({
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

export function GoalsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogKey, setCreateDialogKey] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completedGoalsOpen, setCompletedGoalsOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  const openCreateDialog = () => {
    setCreateDialogKey((k) => k + 1);
    setCreateDialogOpen(true);
  };

  const { data: activeGoalsData, isLoading: activeGoalsLoading } =
    useActiveGoals();
  const { data: completedGoalsData, isLoading: completedGoalsLoading } =
    useListGoals({ active: false });

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const completeGoal = useCompleteGoal();
  const reactivateGoal = useReactivateGoal();
  const deleteGoal = useDeleteGoal();

  const activeGoals = activeGoalsData?.goals ?? [];
  const completedGoals =
    completedGoalsData?.pages.flatMap((page) => page.goals) ?? [];

  const handleCreateGoal = (goalText: string) => {
    createGoal.mutate(
      { goalText, isActive: true },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
        },
      }
    );
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setEditDialogOpen(true);
  };

  const handleUpdateGoal = (goalText: string) => {
    if (editingGoal) {
      updateGoal.mutate(
        { id: editingGoal.id, input: { goalText } },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setEditingGoal(null);
          },
        }
      );
    }
  };

  const handleCompleteGoal = (goal: Goal) => {
    completeGoal.mutate(goal.id);
  };

  const handleReactivateGoal = (goal: Goal) => {
    reactivateGoal.mutate(goal.id);
  };

  const handleDeleteClick = (goal: Goal) => {
    setDeletingGoal(goal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingGoal) {
      deleteGoal.mutate(deletingGoal.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDeletingGoal(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground text-lg">
            Manage your training goals
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
          {activeGoalsLoading && (
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
          {!activeGoalsLoading && activeGoals.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No active goals.{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={openCreateDialog}
                  >
                    Create your first goal
                  </Button>
                  .
                </p>
              </CardContent>
            </Card>
          )}
          {!activeGoalsLoading && activeGoals.length > 0 && (
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onComplete={() => handleCompleteGoal(goal)}
                  onEdit={() => handleEditGoal(goal)}
                  onDelete={() => handleDeleteClick(goal)}
                />
              ))}
            </div>
          )}
        </div>

        {completedGoals.length > 0 && (
          <div>
            <Collapsible
              open={completedGoalsOpen}
              onOpenChange={setCompletedGoalsOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto mb-4"
                >
                  <h2 className="text-xl font-semibold">Completed Goals</h2>
                  {completedGoalsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {completedGoalsLoading && (
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
                {!completedGoalsLoading && (
                  <div className="space-y-4">
                    {completedGoals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onComplete={() => {
                          // Completed goals don't need complete action
                        }}
                        onEdit={() => {
                          // Completed goals can't be edited
                        }}
                        onDelete={() => handleDeleteClick(goal)}
                        onReactivate={() => handleReactivateGoal(goal)}
                      />
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>

      <GoalFormDialog
        key={createDialogKey}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateGoal}
        isSubmitting={createGoal.isPending}
      />

      <GoalFormDialog
        key={editingGoal?.id}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        goal={editingGoal ?? undefined}
        onSubmit={handleUpdateGoal}
        isSubmitting={updateGoal.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingGoal(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteGoal.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGoal.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
