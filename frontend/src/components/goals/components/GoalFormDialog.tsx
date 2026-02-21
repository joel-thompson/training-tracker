import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Goal, GoalCategory } from "shared/types";

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
  onSubmit: (
    goalText: string,
    category: GoalCategory | null,
    notes: string | null
  ) => void;
  isSubmitting: boolean;
}) {
  const [goalText, setGoalText] = useState(goal?.goalText ?? "");
  const [category, setCategory] = useState<GoalCategory | null>(
    (goal?.category as GoalCategory | null) ?? null
  );
  const [notes, setNotes] = useState((goal?.notes as string | null) ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalText.trim().length > 0 && goalText.trim().length <= 500) {
      onSubmit(goalText.trim(), category, notes.trim() ? notes.trim() : null);
    }
  };

  const remainingChars = 500 - goalText.length;
  const remainingNotesChars = 1000 - notes.length;

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
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category ?? "none"}
                onValueChange={(value) =>
                  setCategory(value === "none" ? null : (value as GoalCategory))
                }
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="submission">Submission</SelectItem>
                  <SelectItem value="escape">Escape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add extra context or details..."
                rows={3}
                maxLength={1000}
                className="resize-none"
              />
              <p className="text-muted-foreground text-xs text-right">
                {remainingNotesChars} characters remaining
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
