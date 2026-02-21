import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoalsPageHeader({ onNewGoal }: { onNewGoal: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Goals</h1>
        <p className="text-muted-foreground text-lg">
          Manage your training goals
        </p>
      </div>
      <Button onClick={onNewGoal}>
        <Plus className="mr-2 h-4 w-4" />
        New Goal
      </Button>
    </div>
  );
}
