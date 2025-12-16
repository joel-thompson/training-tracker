/* eslint-disable react-x/no-array-index-key */
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useCreateSession } from "@/hooks/sessions/useCreateSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassType } from "shared/types";

const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  gi: "Gi",
  nogi: "No-Gi",
  open_mat: "Open Mat",
  private: "Private",
  competition: "Competition",
  other: "Other",
};

export function NewSessionPage() {
  const navigate = useNavigate();
  const createSession = useCreateSession();

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(sessionDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sessionDate}
                    onSelect={(date) => date && setSessionDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classType">Class Type</Label>
              <Select
                value={classType}
                onValueChange={(value) => setClassType(value as ClassType)}
              >
                <SelectTrigger id="classType">
                  <SelectValue placeholder="Select class type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CLASS_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="techniqueCovered">Technique Covered</Label>
              <Textarea
                id="techniqueCovered"
                value={techniqueCovered}
                onChange={(e) => setTechniqueCovered(e.target.value)}
                placeholder="e.g., Armbar from guard, scissor sweep details..."
                rows={3}
                maxLength={1000}
              />
              <p className="text-muted-foreground text-xs">
                {techniqueCovered.length}/1000 characters
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3-2-1 Reflection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>3 Things That Went Well</Label>
              </div>
              {successes.map((success, index) => (
                <div key={`success-${index}`} className="flex gap-2">
                  <Input
                    value={success}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        e.target.value,
                        successes,
                        setSuccesses
                      )
                    }
                    placeholder={`Success ${index + 1}`}
                    maxLength={1000}
                  />
                  {successes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem(index, successes, setSuccesses)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                <Label>2 Things to Improve</Label>
              </div>
              {problems.map((problem, index) => (
                <div key={`problem-${index}`} className="flex gap-2">
                  <Input
                    value={problem}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        e.target.value,
                        problems,
                        setProblems
                      )
                    }
                    placeholder={`Problem ${index + 1}`}
                    maxLength={1000}
                  />
                  {problems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem(index, problems, setProblems)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                <Label>1 Question to Explore</Label>
              </div>
              {questions.map((question, index) => (
                <div key={`question-${index}`} className="flex gap-2">
                  <Input
                    value={question}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        e.target.value,
                        questions,
                        setQuestions
                      )
                    }
                    placeholder={`Question ${index + 1}`}
                    maxLength={1000}
                  />
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem(index, questions, setQuestions)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
            <Textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Any additional notes about this session..."
              rows={6}
              maxLength={5000}
            />
            <p className="text-muted-foreground mt-2 text-xs">
              {generalNotes.length}/5000 characters
            </p>
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
