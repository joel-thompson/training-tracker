import { useState, useMemo } from "react";
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
import type { ClassType, ItemType, SessionItem } from "shared/types";
import { SessionDatePicker } from "./components/SessionDatePicker";
import { ClassTypeSelect } from "./components/ClassTypeSelect";
import { CharCountTextarea } from "./components/CharCountTextarea";
import { ItemInputRow } from "./components/ItemInputRow";
import { ITEM_TYPE_LABELS } from "./components/constants";

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
      techniqueCovered: session.techniqueCovered ?? "",
      generalNotes: session.generalNotes ?? "",
      editingItems: editing,
    };
  }, [session]);

  const [localSessionDate, setLocalSessionDate] = useState<Date | undefined>(
    initialFormState.sessionDate
  );
  const [classType, setClassType] = useState<ClassType | "">(
    initialFormState.classType
  );
  const [techniqueCovered, setTechniqueCovered] = useState(
    initialFormState.techniqueCovered
  );
  const [generalNotes, setGeneralNotes] = useState(
    initialFormState.generalNotes
  );
  const [editingItems, setEditingItems] = useState<Record<string, string>>(
    initialFormState.editingItems
  );
  const [newItemContent, setNewItemContent] = useState<{
    success: string;
    problem: string;
    question: string;
  }>({ success: "", problem: "", question: "" });

  // Use session data directly when available, otherwise use state
  // Key prop ensures component remounts when sessionId changes
  const formSessionDate = localSessionDate ?? initialFormState.sessionDate;
  const formClassType = classType || initialFormState.classType;
  const formTechniqueCovered =
    techniqueCovered || initialFormState.techniqueCovered;
  const formGeneralNotes = generalNotes || initialFormState.generalNotes;
  const formEditingItems =
    Object.keys(editingItems).length > 0
      ? editingItems
      : initialFormState.editingItems;

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !formSessionDate || !formClassType) {
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
        <p className="text-muted-foreground">
          The session you're looking for doesn't exist.
        </p>
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
                Are you sure you want to delete this session? This action cannot
                be undone.
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
                value={formSessionDate}
                onChange={setLocalSessionDate}
                disabled={!formSessionDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classType">Class Type</Label>
              <ClassTypeSelect value={formClassType} onChange={setClassType} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="techniqueCovered">Technique Covered</Label>
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
                      {type === "success" && "Things That Went Well"}
                      {type === "problem" && "Things to Improve"}
                      {type === "question" && "Question to Explore"}
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
                      placeholder={`${ITEM_TYPE_LABELS[type]} ${item.order}`}
                      disabled={deleteItem.isPending}
                    />
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newItemContent[type]}
                      onChange={(e) =>
                        setNewItemContent({
                          ...newItemContent,
                          [type]: e.target.value,
                        })
                      }
                      placeholder={`Add new ${ITEM_TYPE_LABELS[
                        type
                      ].toLowerCase()}`}
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
                      disabled={
                        !newItemContent[type].trim() || addItem.isPending
                      }
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
              addItem.isPending ||
              updateSession.isPending ||
              deleteSession.isPending
            }
          >
            {addItem.isPending || updateSession.isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
