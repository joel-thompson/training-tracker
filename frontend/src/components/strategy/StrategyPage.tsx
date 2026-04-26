import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Loader2, Save, Trash2 } from "lucide-react";
import { GAME_STRATEGY_MAX_LENGTH } from "shared/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDeleteGameStrategy } from "@/hooks/strategy/useDeleteGameStrategy";
import { useGameStrategy } from "@/hooks/strategy/useGameStrategy";
import { useSaveGameStrategy } from "@/hooks/strategy/useSaveGameStrategy";

type MobilePane = "write" | "preview";

const EMPTY_HINT = `# My Strategy

## Core preferences
- I prefer to get on top and stay on top
- I prefer to attack the legs
- I prefer to attack kimuras

## A-game notes
- Best passing entries:
- Best guard:
- Highest-confidence finishes:

## Situations to avoid
- `;

function MarkdownPreview({ markdownText }: { markdownText: string }) {
  if (!markdownText.trim()) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Nothing to preview yet. Write your overall game plan, priorities, and
        preferred routes.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-sm leading-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="border-t pt-4 text-lg font-semibold tracking-tight first:border-t-0 first:pt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold">{children}</h3>
          ),
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => (
            <ul className="ml-5 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-5 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) =>
            className ? (
              <code
                className="block overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b px-3 py-2 font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b px-3 py-2 align-top">{children}</td>
          ),
        }}
      >
        {markdownText}
      </ReactMarkdown>
    </div>
  );
}

export function StrategyPage() {
  const { data, isLoading, isError, error } = useGameStrategy();
  const saveMutation = useSaveGameStrategy();
  const deleteMutation = useDeleteGameStrategy();
  const [draft, setDraft] = useState("");
  const [lastLoadedDraft, setLastLoadedDraft] = useState("");
  const [mobilePane, setMobilePane] = useState<MobilePane>("write");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadedMarkdown = data?.strategy?.markdown ?? "";

  useEffect(() => {
    setLastLoadedDraft(loadedMarkdown);
    setDraft((currentDraft) =>
      currentDraft === "" || currentDraft === lastLoadedDraft
        ? loadedMarkdown
        : currentDraft,
    );
  }, [loadedMarkdown, lastLoadedDraft]);

  const editorExtensions = useMemo(() => [markdown()], []);
  const trimmedDraft = draft.trim();
  const isDirty = draft !== lastLoadedDraft;
  const hasSavedStrategy = lastLoadedDraft.trim().length > 0;
  const canSave =
    isDirty &&
    trimmedDraft.length > 0 &&
    draft.length <= GAME_STRATEGY_MAX_LENGTH &&
    !saveMutation.isPending;
  const mutationError =
    (saveMutation.error instanceof Error && saveMutation.error.message) ||
    (deleteMutation.error instanceof Error && deleteMutation.error.message) ||
    null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-[28rem] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strategy</CardTitle>
          <CardDescription>
            Could not load your strategy document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    const saved = await saveMutation.mutateAsync({ markdown: draft });
    setDraft(saved.markdown);
    setLastLoadedDraft(saved.markdown);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    setDeleteDialogOpen(false);
    setDraft("");
    setLastLoadedDraft("");
    setMobilePane("write");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Strategy</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          Keep one living markdown document for your overall BJJ game. Capture
          your preferred attacks, positional priorities, and the routes you want
          your coach context to reflect.
        </p>
      </div>

      <Card className="border-border/70">
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Strategy Document
            </CardTitle>
            <CardDescription>
              Markdown only. No autosave. Save when you want the coach to start
              using the latest version.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => void handleSave()} disabled={!canSave}>
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!hasSavedStrategy || deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>
              {draft.length}/{GAME_STRATEGY_MAX_LENGTH} characters
            </span>
            <span>
              {isDirty
                ? "Unsaved changes"
                : hasSavedStrategy
                  ? "Saved"
                  : "Not saved yet"}
            </span>
          </div>

          <div className="inline-flex rounded-lg border p-1 md:hidden">
            {(["write", "preview"] as const).map((pane) => (
              <button
                key={pane}
                type="button"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  mobilePane === pane
                    ? "bg-foreground text-background"
                    : "text-muted-foreground",
                )}
                onClick={() => setMobilePane(pane)}
              >
                {pane === "write" ? "Write" : "Preview"}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div
              className={cn(
                "overflow-hidden rounded-xl border bg-card",
                mobilePane !== "write" && "hidden md:block",
              )}
            >
              <div className="border-b px-4 py-3 text-sm font-medium">
                Write
              </div>
              <CodeMirror
                value={draft}
                height="500px"
                extensions={editorExtensions}
                onChange={setDraft}
                placeholder={EMPTY_HINT}
                basicSetup={{
                  lineNumbers: false,
                  foldGutter: false,
                  highlightActiveLine: false,
                }}
              />
            </div>

            <div
              className={cn(
                "overflow-hidden rounded-xl border bg-card",
                mobilePane !== "preview" && "hidden md:block",
              )}
            >
              <div className="border-b px-4 py-3 text-sm font-medium">
                Preview
              </div>
              <div className="min-h-[500px] p-4">
                <MarkdownPreview markdownText={draft} />
              </div>
            </div>
          </div>

          {trimmedDraft.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Start with broad preferences first. This page is for your overall
              game, not session-by-session notes.
            </p>
          )}
          {mutationError && (
            <p className="text-sm text-destructive">{mutationError}</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete strategy document?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your saved strategy markdown. Your local
              draft will also be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
