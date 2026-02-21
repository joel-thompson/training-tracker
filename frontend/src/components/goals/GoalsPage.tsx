import { useState } from "react";
import { useActiveGoals } from "@/hooks/goals/useActiveGoals";
import { useListGoals } from "@/hooks/goals/useListGoals";
import { useCreateGoal } from "@/hooks/goals/useCreateGoal";
import { useUpdateGoal } from "@/hooks/goals/useUpdateGoal";
import { useCompleteGoal } from "@/hooks/goals/useCompleteGoal";
import { useReactivateGoal } from "@/hooks/goals/useReactivateGoal";
import { useDeleteGoal } from "@/hooks/goals/useDeleteGoal";
import { GoalFormDialog } from "./components/GoalFormDialog";
import { GoalsPageHeader } from "./components/GoalsPageHeader";
import { ActiveGoalsSection } from "./components/ActiveGoalsSection";
import { CompletedGoalsSection } from "./components/CompletedGoalsSection";
import { DeleteGoalDialog } from "./components/DeleteGoalDialog";
import type { Goal, GoalCategory } from "shared/types";

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

  const handleCreateGoal = (
    goalText: string,
    category: GoalCategory | null,
    notes: string | null
  ) => {
    createGoal.mutate(
      {
        goalText,
        category: category ?? undefined,
        notes: notes ?? undefined,
        isActive: true,
      },
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

  const handleUpdateGoal = (
    goalText: string,
    category: GoalCategory | null,
    notes: string | null
  ) => {
    if (editingGoal) {
      updateGoal.mutate(
        {
          id: editingGoal.id,
          input: {
            goalText,
            category: category ?? undefined,
            notes: notes ?? undefined,
          },
        },
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
      <GoalsPageHeader onNewGoal={openCreateDialog} />

      <div className="space-y-4">
        <ActiveGoalsSection
          isLoading={activeGoalsLoading}
          goals={activeGoals}
          onComplete={handleCompleteGoal}
          onEdit={handleEditGoal}
          onDelete={handleDeleteClick}
          onCreateGoal={openCreateDialog}
        />

        <CompletedGoalsSection
          isLoading={completedGoalsLoading}
          goals={completedGoals}
          isOpen={completedGoalsOpen}
          onOpenChange={setCompletedGoalsOpen}
          onReactivate={handleReactivateGoal}
          onDelete={handleDeleteClick}
        />
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

      <DeleteGoalDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeletingGoal(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteGoal.isPending}
      />
    </div>
  );
}
