import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useSession } from "@/hooks/sessions/useSession";
import { useUpdateSession } from "@/hooks/sessions/useUpdateSession";
import { useDeleteSession } from "@/hooks/sessions/useDeleteSession";
import { useAddSessionItem } from "@/hooks/sessions/useAddSessionItem";
import { useUpdateSessionItem } from "@/hooks/sessions/useUpdateSessionItem";
import { useDeleteSessionItem } from "@/hooks/sessions/useDeleteSessionItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassType, ItemType, SessionItem, SessionType } from "shared/types";
import { SessionDatePicker } from "./components/SessionDatePicker";
import { ClassTypeSelect } from "./components/ClassTypeSelect";
import { SessionTypeSelect } from "./components/SessionTypeSelect";
import { CharCountTextarea } from "./components/CharCountTextarea";
import { ItemInputRow } from "./components/ItemInputRow";
import { ITEM_TYPE_LABELS } from "shared/constants";

interface EditSessionPageProps {
  sessionId: string;
}

export function EditSessionPage({ sessionId }: EditSessionPageProps) {
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(sessionId);
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const addItem = useAddSessionItem();
  const updateItem = useUpdateSessionItem();
  const deleteItem = useDeleteSessionItem();

  const initialFormState = useMemo(() => {
    if (!session) {
      return {
        sessionDate: undefined as Date | undefined,
        classType: "" as ClassType | "",
        sessionType: "" as SessionType | "",
        techniqueCovered: "",
        generalNotes: "",
        editingItems: {} as Record<string, string>,
      };
    }
    const editing: Record<string, string> = {};
    session.items?.forEach((item) => {
      editing[item.id] = item.content;
    });
    return {
      sessionDate: parseISO(session.sessionDate),
      classType: session.classType,
      sessionType: session.sessionType,
      techniqueCovered: session.techniqueCovered ?? "",
      generalNotes: session.generalNotes ?? "",
      editingItems: editing,
    };
  }, [session]);

  const [localSessionDate, setLocalSessionDate] = useState<Date | undefined>(undefined);
  const [classType, setClassType] = useState<ClassType | "">("");
  const [sessionType, setSessionType] = useState<SessionType | "">("");
  const [techniqueCovered, setTechniqueCovered] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [editingItems, setEditingItems] = useState<Record<string, string>>({});
  const [newItemContent, setNewItemContent] = useState<{
    success: string;
    problem: string;
    question: string;
  }>({ success: "", problem: "", question: "" });

  useEffect(() => {
    if (!session) {
      return;
    }

    setLocalSessionDate(initialFormState.sessionDate);
    setClassType(initialFormState.classType);
    setSessionType(initialFormState.sessionType);
    setTechniqueCovered(initialFormState.techniqueCovered);
    setGeneralNotes(initialFormState.generalNotes);
    setEditingItems(initialFormState.editingItems);
  }, [initialFormState, session]);

  const formSessionDate = localSessionDate;
  const formClassType = classType;
  const formSessionType = sessionType;
  const formTechniqueCovered = techniqueCovered;
  const formGeneralNotes = generalNotes;
  const formEditingItems = editingItems;

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !formSessionDate || !formClassType || !formSessionType) {
      return;
    }

    // Save any pending new items first
    const pendingItemPromises = (["success", "problem", "question"] as const)
      .filter((type) => newItemContent[type].trim())
      .map((type) =>
        addItem.mutateAsync({
          sessionId: session.id,
          input: { type, content: newItemContent[type].trim() },
        })
      );

    if (pendingItemPromises.length > 0) {
      await Promise.all(pendingItemPromises);
      setNewItemContent({ success: "", problem: "", question: "" });
    }

    updateSession.mutate(
      {
        id: session.id,
        input: {
          sessionDate: format(formSessionDate, "yyyy-MM-dd"),
          classType: formClassType,
          sessionType: formSessionType,
          techniqueCovered: formTechniqueCovered.trim() || null,
          generalNotes: formGeneralNotes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          void navigate({ to: "/history" });
        },
      }
    );
  };

  const handleDeleteSession = () => {
    if (!session) return;
    deleteSession.mutate(session.id, {
      onSuccess: () => {
        void navigate({ to: "/history" });
      },
    });
  };

  const handleAddItem = (type: ItemType) => {
    if (!session) return;
    const content = newItemContent[type].trim();
    if (!content) return;

    addItem.mutate(
      {
        sessionId: session.id,
        input: { type, content },
      },
      {
        onSuccess: () => {
          setNewItemContent((prev) => ({ ...prev, [type]: "" }));
        },
      }
    );
  };

  const handleUpdateItem = (item: SessionItem) => {
    if (!session) return;
    const content = formEditingItems[item.id]?.trim();
    if (!content) return;

    updateItem.mutate({
      sessionId: session.id,
      itemId: item.id,
      input: { content },
    });
  };

  const handleDeleteItem = (item: SessionItem) => {
    if (!session) return;
    deleteItem.mutate({
      sessionId: session.id,
      itemId: item.id,
    });
  };

  const getItemsByType = (type: ItemType) => {
    return session?.items?.filter((item) => item.type === type) ?? [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Session Not Found</h1>
        <p className="text-muted-foreground">The session you're looking for doesn't exist.</p>
        <Button
          onClick={() => {
            void navigate({ to: "/history" });
          }}
        >
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Session</h1>
          <p className="text-muted-foreground text-lg">
            {format(parseISO(session.sessionDate), "PPP")}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Session
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this session? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSession}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form
        onSubmit={(e) => {
          void handleUpdateSession(e);
        }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionDate">Date</Label>
              <SessionDatePicker
                id="sessionDate"
                value={formSessionDate}
                onChange={setLocalSessionDate}
                disabled={!formSessionDate}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="classType">Class Type</Label>
                <ClassTypeSelect value={formClassType} onChange={setClassType} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionType">Session Type</Label>
                <SessionTypeSelect value={formSessionType} onChange={setSessionType} />
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              Update how this session should appear in history and the coach context.
            </p>

            <div className="space-y-2">
              <Label htmlFor="techniqueCovered">Main Position / Technique</Label>
              <CharCountTextarea
                id="techniqueCovered"
                value={formTechniqueCovered}
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
            {(["success", "problem", "question"] as const).map((type) => {
              const items = getItemsByType(type);
              return (
                <div key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>
                      {type === "success" && "What Clicked"}
                      {type === "problem" && "Where You Got Stuck"}
                      {type === "question" && "What To Review Next"}
                    </Label>
                  </div>
                  {items.map((item) => (
                    <ItemInputRow
                      key={item.id}
                      value={formEditingItems[item.id] ?? ""}
                      onChange={(value) =>
                        setEditingItems({
                          ...formEditingItems,
                          [item.id]: value,
                        })
                      }
                      onBlur={() => {
                        handleUpdateItem(item);
                      }}
                      onRemove={() => {
                        handleDeleteItem(item);
                      }}
                      name={`${type}-${item.id}`}
                      placeholder={`${ITEM_TYPE_LABELS[type]} ${item.order}`}
                      disabled={deleteItem.isPending}
                    />
                  ))}
                  <div className="flex gap-2">
                    <Input
                      aria-label={`Add new ${ITEM_TYPE_LABELS[type].toLowerCase()}`}
                      name={`new-${type}`}
                      autoComplete="off"
                      value={newItemContent[type]}
                      onChange={(e) =>
                        setNewItemContent({
                          ...newItemContent,
                          [type]: e.target.value,
                        })
                      }
                      placeholder={`Add new ${ITEM_TYPE_LABELS[type].toLowerCase()}`}
                      maxLength={1000}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddItem(type);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        handleAddItem(type);
                      }}
                      aria-label={`Add new ${ITEM_TYPE_LABELS[type].toLowerCase()}`}
                      disabled={!newItemContent[type].trim() || addItem.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <CharCountTextarea
              value={formGeneralNotes}
              onChange={setGeneralNotes}
              placeholder="Any additional context, coaching cues, or reminders..."
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
              void navigate({ to: "/history" });
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !formSessionDate ||
              !formClassType ||
              !formSessionType ||
              addItem.isPending ||
              updateSession.isPending ||
              deleteSession.isPending
            }
          >
            {addItem.isPending || updateSession.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
