/* eslint-disable react-x/no-array-index-key */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { format, isValid, parseISO } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCreateSession } from "@/hooks/sessions/useCreateSession";
import { useActiveGoals } from "@/hooks/goals/useActiveGoals";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SESSION_TYPE_LABELS, SESSION_TYPES } from "shared/constants";
import type { ClassType, SessionType } from "shared/types";
import { SessionDatePicker } from "./components/SessionDatePicker";
import { CharCountTextarea } from "./components/CharCountTextarea";
import { ItemInputRow } from "./components/ItemInputRow";
import {
  getDraftKey,
  getStoredClassType,
  getStoredSessionType,
  parseStoredDraft,
  type SessionDraftState,
} from "./sessionDraftStorage";

const QUICK_CAPTURE_COPY = {
  success: {
    title: "What Clicked Today?",
    placeholder: "e.g., Kept elbows tight in mount escapes and recovered half guard twice",
    addLabel: "Add another win",
  },
  problem: {
    title: "Where Did You Get Stuck?",
    placeholder: "e.g., Lost inside position when hand fighting from seated guard",
    addLabel: "Add another issue",
  },
  question: {
    title: "What Should You Review Next?",
    placeholder: "e.g., Ask about connecting collar sleeve to triangle when they posture",
    addLabel: "Add another question",
  },
} as const;

function hasFilledRow(rows: string[]) {
  return rows.some((row) => row.trim().length > 0);
}

function getInitialSessionDetailsOpen() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.innerWidth >= 768;
}

function SegmentedChoice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (nextValue: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/30 p-1">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-10 rounded-lg border border-transparent font-medium",
              value === option.value && "border-border bg-background shadow-sm"
            )}
            aria-pressed={value === option.value}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function QuickCaptureSection({
  type,
  values,
  onChange,
  onAdd,
  onRemove,
  onKeyDown,
  autoFocusFirstInput = false,
}: {
  type: "success" | "problem" | "question";
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onKeyDown: (index: number, value: string, event: React.KeyboardEvent) => void;
  autoFocusFirstInput?: boolean;
}) {
  const copy = QUICK_CAPTURE_COPY[type];

  return (
    <div className="space-y-3">
      <Label>{copy.title}</Label>
      {values.map((value, index) => (
        <ItemInputRow
          key={`${type}-${index}`}
          value={value}
          onChange={(nextValue) => onChange(index, nextValue)}
          onRemove={index > 0 ? () => onRemove(index) : undefined}
          onKeyDown={(event) => onKeyDown(index, value, event)}
          placeholder={copy.placeholder}
          ariaLabel={`${copy.title} ${index + 1}`}
          removeLabel={`Remove ${copy.title.toLowerCase()} ${index + 1}`}
          name={`${type}-${index}`}
          showRemove={index > 0}
          autoFocus={autoFocusFirstInput && index === 0}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        {copy.addLabel}
      </Button>
    </div>
  );
}

interface NewSessionPageProps {
  resumeDraft?: boolean;
}

function restoreDraft(storedDraft: SessionDraftState, restoreFns: {
  setSessionDate: (value: Date) => void;
  setClassType: (value: ClassType) => void;
  setSessionType: (value: SessionType) => void;
  setTechniqueCovered: (value: string) => void;
  setGeneralNotes: (value: string) => void;
  setSuccesses: (value: string[]) => void;
  setProblems: (value: string[]) => void;
  setQuestions: (value: string[]) => void;
  setOptionalDetailsOpen: (value: boolean) => void;
  setDraftNotice: (value: string | null) => void;
}) {
  const parsedDate = parseISO(storedDraft.sessionDate);
  if (isValid(parsedDate)) {
    restoreFns.setSessionDate(parsedDate);
  }
  restoreFns.setClassType(storedDraft.classType);
  restoreFns.setSessionType(storedDraft.sessionType);
  restoreFns.setTechniqueCovered(storedDraft.techniqueCovered);
  restoreFns.setGeneralNotes(storedDraft.generalNotes);
  restoreFns.setSuccesses(storedDraft.successes);
  restoreFns.setProblems(storedDraft.problems);
  restoreFns.setQuestions(storedDraft.questions);
  restoreFns.setOptionalDetailsOpen(
    storedDraft.techniqueCovered.trim().length > 0 || storedDraft.generalNotes.trim().length > 0
  );
  restoreFns.setDraftNotice("Restored your unfinished session draft.");
}

export function NewSessionPage({ resumeDraft = false }: NewSessionPageProps) {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const createSession = useCreateSession();
  const { data: activeGoalsData, isLoading: activeGoalsLoading } = useActiveGoals();
  const initialDateRef = useRef(format(new Date(), "yyyy-MM-dd"));
  const initialClassTypeRef = useRef(getStoredClassType());
  const initialSessionTypeRef = useRef(getStoredSessionType());

  const activeGoals = activeGoalsData?.goals ?? [];

  const [sessionDate, setSessionDate] = useState<Date>(() => new Date());
  const [classType, setClassType] = useState<ClassType>(() => getStoredClassType());
  const [sessionType, setSessionType] = useState<SessionType>(() => getStoredSessionType());
  const [techniqueCovered, setTechniqueCovered] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [successes, setSuccesses] = useState<string[]>([""]);
  const [problems, setProblems] = useState<string[]>([""]);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(getInitialSessionDetailsOpen);
  const [optionalDetailsOpen, setOptionalDetailsOpen] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [shouldFocusFirstInput, setShouldFocusFirstInput] = useState(false);

  const hasMeaningfulContent = useMemo(
    () =>
      techniqueCovered.trim().length > 0 ||
      generalNotes.trim().length > 0 ||
      hasFilledRow(successes) ||
      hasFilledRow(problems) ||
      hasFilledRow(questions),
    [generalNotes, problems, questions, successes, techniqueCovered]
  );

  const isDirty = useMemo(
    () =>
      hasMeaningfulContent ||
      classType !== initialClassTypeRef.current ||
      sessionType !== initialSessionTypeRef.current ||
      format(sessionDate, "yyyy-MM-dd") !== initialDateRef.current,
    [classType, hasMeaningfulContent, sessionDate, sessionType]
  );

  const sessionDetailsSummary = `${SESSION_TYPE_LABELS[sessionType]} • ${format(sessionDate, "MMM d")} • ${classType === "nogi" ? "No-Gi" : "Gi"}`;

  useEffect(() => {
    window.localStorage.setItem("training-tracker:last-class-type", classType);
  }, [classType]);

  useEffect(() => {
    window.localStorage.setItem("training-tracker:last-session-type", sessionType);
  }, [sessionType]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const storedDraft = parseStoredDraft(window.localStorage.getItem(getDraftKey(userId)));
    if (!storedDraft) {
      setShouldFocusFirstInput(true);
      return;
    }

    if (resumeDraft) {
      restoreDraft(storedDraft, {
        setSessionDate,
        setClassType,
        setSessionType,
        setTechniqueCovered,
        setGeneralNotes,
        setSuccesses,
        setProblems,
        setQuestions,
        setOptionalDetailsOpen,
        setDraftNotice,
      });
      setShouldFocusFirstInput(true);
      return;
    }

    const shouldRestore = window.confirm("Restore the session draft you left unfinished?");
    if (!shouldRestore) {
      window.localStorage.removeItem(getDraftKey(userId));
      setShouldFocusFirstInput(true);
      return;
    }

    restoreDraft(storedDraft, {
      setSessionDate,
      setClassType,
      setSessionType,
      setTechniqueCovered,
      setGeneralNotes,
      setSuccesses,
      setProblems,
      setQuestions,
      setOptionalDetailsOpen,
      setDraftNotice,
    });
    setShouldFocusFirstInput(true);
  }, [resumeDraft, userId]);

  useEffect(() => {
    if (!shouldFocusFirstInput) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      document.querySelector<HTMLInputElement>('input[name="success-0"]')?.focus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [shouldFocusFirstInput]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const draftKey = getDraftKey(userId);
    if (!isDirty || createSession.isPending) {
      window.localStorage.removeItem(draftKey);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const draft: SessionDraftState = {
        savedAt: new Date().toISOString(),
        sessionDate: format(sessionDate, "yyyy-MM-dd"),
        classType,
        sessionType,
        techniqueCovered,
        generalNotes,
        successes,
        problems,
        questions,
      };
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    classType,
    createSession.isPending,
    generalNotes,
    isDirty,
    problems,
    questions,
    sessionDate,
    sessionType,
    successes,
    techniqueCovered,
    userId,
  ]);

  useBlocker({
    shouldBlockFn: () => {
      if (!isDirty || createSession.isPending) {
        return false;
      }

      return !window.confirm("Leave this page and discard your unsaved session draft?");
    },
    enableBeforeUnload: true,
  });

  const updateRow = (
    index: number,
    value: string,
    rows: string[],
    setRows: Dispatch<SetStateAction<string[]>>
  ) => {
    setRows(rows.map((row, rowIndex) => (rowIndex === index ? value : row)));
  };

  const addRow = (setRows: Dispatch<SetStateAction<string[]>>) => {
    setRows((currentRows) => [...currentRows, ""]);
  };

  const removeRow = (
    index: number,
    rows: string[],
    setRows: Dispatch<SetStateAction<string[]>>
  ) => {
    if (rows.length === 1) {
      setRows([""]);
      return;
    }

    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleRowKeyDown = (
    index: number,
    value: string,
    rows: string[],
    setRows: Dispatch<SetStateAction<string[]>>,
    event: KeyboardEvent
  ) => {
    if (event.key === "Enter" && value.trim().length > 0) {
      event.preventDefault();
      if (index === rows.length - 1) {
        addRow(setRows);
      }
      return;
    }

    if (event.key === "Backspace" && value.length === 0 && rows.length > 1 && index > 0) {
      event.preventDefault();
      removeRow(index, rows, setRows);
    }
  };

  const saveSession = (attendanceOnly: boolean) => {
    if (
      attendanceOnly &&
      hasMeaningfulContent &&
      !window.confirm("Save this as attendance only and discard the details you entered?")
    ) {
      return;
    }

    const items: {
      success?: string[];
      problem?: string[];
      question?: string[];
    } = {};

    const successItems = successes.map((item) => item.trim()).filter(Boolean);
    const problemItems = problems.map((item) => item.trim()).filter(Boolean);
    const questionItems = questions.map((item) => item.trim()).filter(Boolean);

    if (successItems.length > 0) items.success = successItems;
    if (problemItems.length > 0) items.problem = problemItems;
    if (questionItems.length > 0) items.question = questionItems;

    createSession.mutate(
      {
        sessionDate: format(sessionDate, "yyyy-MM-dd"),
        classType,
        sessionType,
        techniqueCovered: attendanceOnly ? null : techniqueCovered.trim() || null,
        generalNotes: attendanceOnly ? null : generalNotes.trim() || null,
        items: attendanceOnly || Object.keys(items).length === 0 ? undefined : items,
      },
      {
        onSuccess: (session) => {
          if (userId) {
            window.localStorage.removeItem(getDraftKey(userId));
          }
          void navigate({
            to: "/history",
            search: { savedSessionId: session.id },
          });
        },
      }
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!hasMeaningfulContent) {
      return;
    }
    saveSession(false);
  };

  const sessionTypeSummary =
    sessionType === "competition"
      ? "Track what held up under pressure."
      : sessionType === "sparring"
        ? "Capture the exchanges that exposed habits."
        : sessionType === "drilling"
          ? "Log the reps and details worth keeping."
          : sessionType === "open_mat"
            ? "Focus on the rounds and positional patterns."
            : sessionType === "private"
              ? "Hold onto the precise coaching cues."
              : "Keep the key lessons from class while they are fresh.";

  return (
    <div className="space-y-6 pb-32 md:pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Log Session</h1>
        <p className="text-muted-foreground text-lg">
          Capture the parts worth remembering before they fade.
        </p>
      </div>

      {draftNotice && (
        <div
          className="flex items-start justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3"
          aria-live="polite"
        >
          <p className="text-sm">{draftNotice}</p>
          <Button variant="ghost" size="sm" onClick={() => setDraftNotice(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {activeGoalsLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-56" />
          </CardHeader>
        </Card>
      )}

      {!activeGoalsLoading && activeGoals.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Today&apos;s Goals</CardTitle>
              <Link to="/goals" className="text-primary text-sm underline">
                View all
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              Keep these in mind while you log what happened.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeGoals.slice(0, 2).map((goal) => (
                <div key={goal.id} className="rounded-full border bg-background px-4 py-2 text-sm">
                  {goal.goalText}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
      <CardHeader className="space-y-2">
            <CardTitle>Quick Capture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <QuickCaptureSection
              type="success"
              values={successes}
              onChange={(index, value) => updateRow(index, value, successes, setSuccesses)}
              onAdd={() => addRow(setSuccesses)}
              onRemove={(index) => removeRow(index, successes, setSuccesses)}
              onKeyDown={(index, value, event) =>
                handleRowKeyDown(index, value, successes, setSuccesses, event)
              }
              autoFocusFirstInput={shouldFocusFirstInput}
            />

            <QuickCaptureSection
              type="problem"
              values={problems}
              onChange={(index, value) => updateRow(index, value, problems, setProblems)}
              onAdd={() => addRow(setProblems)}
              onRemove={(index) => removeRow(index, problems, setProblems)}
              onKeyDown={(index, value, event) =>
                handleRowKeyDown(index, value, problems, setProblems, event)
              }
            />

            <QuickCaptureSection
              type="question"
              values={questions}
              onChange={(index, value) => updateRow(index, value, questions, setQuestions)}
              onAdd={() => addRow(setQuestions)}
              onRemove={(index) => removeRow(index, questions, setQuestions)}
              onKeyDown={(index, value, event) =>
                handleRowKeyDown(index, value, questions, setQuestions, event)
              }
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <Collapsible open={sessionDetailsOpen} onOpenChange={setSessionDetailsOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5 text-left"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Session Details</h2>
                  <p className="text-muted-foreground text-sm">
                    {sessionDetailsOpen ? sessionTypeSummary : sessionDetailsSummary}
                  </p>
                </div>
                <span className="mt-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {sessionDetailsOpen ? "Hide" : "Show"}
                  {sessionDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label>Session Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {SESSION_TYPES.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSessionType(value)}
                        className={cn(
                          "rounded-full border-border/80 px-4",
                          sessionType === value && "border-primary bg-primary/10 text-primary"
                        )}
                        aria-pressed={sessionType === value}
                      >
                        {SESSION_TYPE_LABELS[value]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionDate">Date</Label>
                    <SessionDatePicker id="sessionDate" value={sessionDate} onChange={setSessionDate} />
                  </div>
                  <SegmentedChoice
                    label="Class Type"
                    options={[
                      { value: "gi", label: "Gi" },
                      { value: "nogi", label: "No-Gi" },
                    ]}
                    value={classType}
                    onChange={(value) => setClassType(value as ClassType)}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card>
          <Collapsible open={optionalDetailsOpen} onOpenChange={setOptionalDetailsOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <div>
                  <div className="font-semibold">Optional Details</div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Add the main position, technique, or anything else worth keeping.
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {optionalDetailsOpen ? "Hide" : "Show"}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-5 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="techniqueCovered">Main Position / Technique</Label>
                  <CharCountTextarea
                    id="techniqueCovered"
                    value={techniqueCovered}
                    onChange={setTechniqueCovered}
                    placeholder="e.g., Collar-sleeve to triangle, top half passing, back escape details"
                    rows={3}
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generalNotes">Extra Notes</Label>
                  <CharCountTextarea
                    id="generalNotes"
                    value={generalNotes}
                    onChange={setGeneralNotes}
                    placeholder="Anything else: coaching cues, rounds, energy, match prep, or reminders."
                    rows={5}
                    maxLength={5000}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {createSession.error && (
          <div
            className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {createSession.error.message}
          </div>
        )}

        <div className="md:hidden">
          <Button
            type="button"
            variant="ghost"
            className="px-0 text-muted-foreground"
            disabled={createSession.isPending}
            onClick={() => saveSession(true)}
          >
            Attendance Only
          </Button>
        </div>

        <div className="hidden items-center justify-between gap-4 md:flex">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void navigate({ to: "/" });
            }}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={createSession.isPending}
              onClick={() => saveSession(true)}
            >
              Attendance Only
            </Button>
            <Button type="submit" disabled={!hasMeaningfulContent || createSession.isPending}>
              {createSession.isPending ? "Saving..." : "Save Session"}
            </Button>
          </div>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Button
            type="button"
            className="flex-1"
            disabled={!hasMeaningfulContent || createSession.isPending}
            onClick={() => saveSession(false)}
          >
            {createSession.isPending ? "Saving..." : "Save Session"}
          </Button>
        </div>
      </div>
    </div>
  );
}
