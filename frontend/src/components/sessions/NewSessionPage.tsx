/* eslint-disable react-x/no-array-index-key */
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useCreateSession } from "@/hooks/sessions/useCreateSession";
import { useActiveGoals } from "@/hooks/goals/useActiveGoals";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassType } from "shared/types";
import { SessionDatePicker } from "./components/SessionDatePicker";
import { ClassTypeSelect } from "./components/ClassTypeSelect";
import { CharCountTextarea } from "./components/CharCountTextarea";
import { ItemInputRow } from "./components/ItemInputRow";

export function NewSessionPage() {
  const navigate = useNavigate();
  const createSession = useCreateSession();
  const { data: activeGoalsData, isLoading: activeGoalsLoading } =
    useActiveGoals();
  const [goalsOpen, setGoalsOpen] = useState(true);

  const activeGoals = activeGoalsData?.goals ?? [];

  const [sessionDate, setSessionDate] = useState<Date>(() => new Date());
  const [classType, setClassType] = useState<ClassType>("gi");
  const [techniqueCovered, setTechniqueCovered] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [successes, setSuccesses] = useState<string[]>(["", "", ""]);
  const [problems, setProblems] = useState<string[]>(["", ""]);
  const [questions, setQuestions] = useState<string[]>([""]);

  const handleAddItem = (
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    setItems([...items, ""]);
  };

  const handleRemoveItem = (
    index: number,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    value: string,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!classType) {
      return;
    }

    const items: {
      success?: string[];
      problem?: string[];
      question?: string[];
    } = {};

    const successItems = successes.filter((s) => s.trim().length > 0);
    const problemItems = problems.filter((p) => p.trim().length > 0);
    const questionItems = questions.filter((q) => q.trim().length > 0);

    if (successItems.length > 0) items.success = successItems;
    if (problemItems.length > 0) items.problem = problemItems;
    if (questionItems.length > 0) items.question = questionItems;

    createSession.mutate(
      {
        sessionDate: format(sessionDate, "yyyy-MM-dd"),
        classType,
        techniqueCovered: techniqueCovered.trim() || null,
        generalNotes: generalNotes.trim() || null,
        items: Object.keys(items).length > 0 ? items : undefined,
      },
      {
        onSuccess: () => {
          void navigate({ to: "/history" });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Session</h1>
        <p className="text-muted-foreground text-lg">
          Log a new training session
        </p>
      </div>

      {activeGoalsLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
        </Card>
      )}

      {!activeGoalsLoading && activeGoals.length > 0 && (
        <Card>
          <Collapsible open={goalsOpen} onOpenChange={setGoalsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Current Goals
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/goals"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary text-sm underline"
                    >
                      Manage
                    </Link>
                    {goalsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
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
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionDate">Date</Label>
              <SessionDatePicker
                value={sessionDate}
                onChange={setSessionDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classType">Class Type</Label>
              <ClassTypeSelect value={classType} onChange={setClassType} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="techniqueCovered">Technique Covered</Label>
              <CharCountTextarea
                id="techniqueCovered"
                value={techniqueCovered}
                onChange={setTechniqueCovered}
                placeholder="e.g., Armbar from guard, scissor sweep details..."
                rows={3}
                maxLength={1000}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reflection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Things That Went Well</Label>
              </div>
              {successes.map((success, index) => (
                <ItemInputRow
                  key={`success-${index}`}
                  value={success}
                  onChange={(value) =>
                    handleItemChange(index, value, successes, setSuccesses)
                  }
                  onRemove={
                    successes.length > 1
                      ? () => handleRemoveItem(index, successes, setSuccesses)
                      : undefined
                  }
                  placeholder={`Success ${index + 1}`}
                  showRemove={successes.length > 1}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem(successes, setSuccesses)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Success
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Things to Improve</Label>
              </div>
              {problems.map((problem, index) => (
                <ItemInputRow
                  key={`problem-${index}`}
                  value={problem}
                  onChange={(value) =>
                    handleItemChange(index, value, problems, setProblems)
                  }
                  onRemove={
                    problems.length > 1
                      ? () => handleRemoveItem(index, problems, setProblems)
                      : undefined
                  }
                  placeholder={`Problem ${index + 1}`}
                  showRemove={problems.length > 1}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem(problems, setProblems)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Problem
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Question to Explore</Label>
              </div>
              {questions.map((question, index) => (
                <ItemInputRow
                  key={`question-${index}`}
                  value={question}
                  onChange={(value) =>
                    handleItemChange(index, value, questions, setQuestions)
                  }
                  onRemove={
                    questions.length > 1
                      ? () => handleRemoveItem(index, questions, setQuestions)
                      : undefined
                  }
                  placeholder={`Question ${index + 1}`}
                  showRemove={questions.length > 1}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem(questions, setQuestions)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <CharCountTextarea
              value={generalNotes}
              onChange={setGeneralNotes}
              placeholder="Any additional notes about this session..."
              rows={6}
              maxLength={5000}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void navigate({ to: "/" });
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!classType || createSession.isPending}
          >
            {createSession.isPending ? "Saving..." : "Save Session"}
          </Button>
        </div>
      </form>
    </div>
  );
}
