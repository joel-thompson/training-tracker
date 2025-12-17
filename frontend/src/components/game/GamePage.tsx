import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import { useGameItems } from "@/hooks/game/useGameItems";
import { useGameTransitions } from "@/hooks/game/useGameTransitions";
import { useCreateGameItem } from "@/hooks/game/useCreateGameItem";
import { useUpdateGameItem } from "@/hooks/game/useUpdateGameItem";
import { useDeleteGameItem } from "@/hooks/game/useDeleteGameItem";
import { useCreateGameTransition } from "@/hooks/game/useCreateGameTransition";
import { useDeleteGameTransition } from "@/hooks/game/useDeleteGameTransition";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GameItem, GameTransition } from "shared/types";

function flattenItems(items: GameItem[]): GameItem[] {
  const result: GameItem[] = [];
  function traverse(item: GameItem) {
    result.push(item);
    if (item.children) {
      for (const child of item.children) {
        traverse(child);
      }
    }
  }
  for (const item of items) {
    traverse(item);
  }
  return result;
}

function GameItemRow({
  item,
  level = 0,
  transitions,
  onEdit,
  onDelete,
  onAddChild,
  onAddTransition,
  onDeleteTransition,
}: {
  item: GameItem;
  level?: number;
  transitions: GameTransition[];
  onEdit: (item: GameItem) => void;
  onDelete: (item: GameItem) => void;
  onAddChild: (parentId: string) => void;
  onAddTransition: (fromItemId: string) => void;
  onDeleteTransition: (transitionId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const outgoingTransitions = transitions.filter(
    (t) => t.fromItemId === item.id
  );
  const incomingTransitions = transitions.filter((t) => t.toItemId === item.id);

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        {hasChildren ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <div className="h-6 w-6" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item.name}</span>
            {(outgoingTransitions.length > 0 ||
              incomingTransitions.length > 0) && (
              <span className="text-muted-foreground text-xs">
                ({outgoingTransitions.length}→ {incomingTransitions.length}←)
              </span>
            )}
          </div>
          {item.notes && (
            <p className="text-muted-foreground text-sm truncate">
              {item.notes}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddChild(item.id)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddTransition(item.id)}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Add Transition
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {hasChildren && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div>
              {item.children!.map((child) => (
                <GameItemRow
                  key={child.id}
                  item={child}
                  level={level + 1}
                  transitions={transitions}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  onAddTransition={onAddTransition}
                  onDeleteTransition={onDeleteTransition}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function ItemFormDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: GameItem;
  onSubmit: (data: { name: string; notes?: string | null }) => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onSubmit({ name: name.trim(), notes: notes.trim() || null });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{item ? "Edit Item" : "New Item"}</DialogTitle>
            <DialogDescription>
              {item
                ? "Update this item"
                : "Add a new position or technique to your game"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Closed Guard, Knee Cut..."
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add details about this position or technique..."
                rows={4}
                maxLength={5000}
                className="resize-none"
              />
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
              disabled={isSubmitting || name.trim().length === 0}
            >
              {isSubmitting ? "Saving..." : item ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransitionDialog({
  open,
  onOpenChange,
  fromItemId,
  allItems,
  transitions,
  onSubmit,
  onDelete,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromItemId: string;
  allItems: GameItem[];
  transitions: GameTransition[];
  onSubmit: (toItemId: string, notes?: string | null) => void;
  onDelete: (transitionId: string) => void;
  isSubmitting: boolean;
}) {
  const [toItemId, setToItemId] = useState("");
  const [notes, setNotes] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const outgoingTransitions = transitions.filter(
    (t) => t.fromItemId === fromItemId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (toItemId) {
      onSubmit(toItemId, notes.trim() || null);
      setToItemId("");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transitions</DialogTitle>
          <DialogDescription>
            Define when and how you move from this position to others
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Outgoing Transitions</Label>
            {outgoingTransitions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No transitions yet. Add one below.
              </p>
            ) : (
              <ScrollArea className="h-32 rounded-md border p-4">
                <div className="space-y-2">
                  {outgoingTransitions.map((transition) => {
                    const toItem = allItems.find(
                      (item) => item.id === transition.toItemId
                    );
                    return (
                      <div
                        key={transition.id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4" />
                            <span className="font-medium">
                              {toItem?.name ?? "Unknown"}
                            </span>
                          </div>
                          {transition.notes && (
                            <p className="text-muted-foreground text-sm">
                              {transition.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transition.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="toItem">To</Label>
              <Popover open={showPicker} onOpenChange={setShowPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    type="button"
                  >
                    {toItemId
                      ? allItems.find((item) => item.id === toItemId)?.name
                      : "Select target position..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {allItems.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setToItemId(item.id);
                            setShowPicker(false);
                          }}
                        >
                          {item.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transitionNotes">Notes (optional)</Label>
              <Textarea
                id="transitionNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., when opponent stands, if I free my leg..."
                rows={2}
                maxLength={1000}
                className="resize-none"
              />
            </div>
            <Button type="submit" disabled={isSubmitting || !toItemId}>
              {isSubmitting ? "Adding..." : "Add Transition"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GamePage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GameItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GameItem | null>(null);
  const [transitionFromItemId, setTransitionFromItemId] = useState<
    string | null
  >(null);
  const [parentId, setParentId] = useState<string | null>(null);

  const { data: itemsData, isLoading: itemsLoading } = useGameItems();
  const { data: transitionsData } = useGameTransitions();

  const createItem = useCreateGameItem();
  const updateItem = useUpdateGameItem();
  const deleteItem = useDeleteGameItem();
  const createTransition = useCreateGameTransition();
  const deleteTransition = useDeleteGameTransition();

  const items = itemsData?.items ?? [];
  const transitions = transitionsData?.transitions ?? [];
  const allItems = flattenItems(items);

  const handleCreateItem = (data: { name: string; notes?: string | null }) => {
    createItem.mutate(
      {
        name: data.name,
        notes: data.notes ?? null,
        parentId: parentId,
        displayOrder: 0,
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
          setParentId(null);
        },
      }
    );
  };

  const handleEditItem = (item: GameItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleUpdateItem = (data: { name: string; notes?: string | null }) => {
    if (editingItem) {
      updateItem.mutate(
        {
          id: editingItem.id,
          input: {
            name: data.name,
            notes: data.notes ?? null,
          },
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setEditingItem(null);
          },
        }
      );
    }
  };

  const handleDeleteClick = (item: GameItem) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      deleteItem.mutate(deletingItem.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDeletingItem(null);
        },
      });
    }
  };

  const handleAddTransition = (fromItemId: string) => {
    setTransitionFromItemId(fromItemId);
    setTransitionDialogOpen(true);
  };

  const handleCreateTransition = (toItemId: string, notes?: string | null) => {
    if (transitionFromItemId) {
      createTransition.mutate(
        {
          fromItemId: transitionFromItemId,
          toItemId,
          notes: notes ?? null,
        },
        {
          onSuccess: () => {
            // Keep dialog open for adding more transitions
          },
        }
      );
    }
  };

  const handleDeleteTransition = (transitionId: string) => {
    deleteTransition.mutate(transitionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Game</h1>
          <p className="text-muted-foreground text-lg">
            Build and organize your BJJ system
          </p>
        </div>
        <Button
          onClick={() => {
            setParentId(null);
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Positions & Techniques</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {!itemsLoading && items.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No items yet.{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => {
                    setParentId(null);
                    setCreateDialogOpen(true);
                  }}
                >
                  Create your first item
                </Button>
                .
              </p>
            </div>
          )}
          {!itemsLoading && items.length > 0 && (
            <div className="space-y-1">
              {items.map((item) => (
                <GameItemRow
                  key={item.id}
                  item={item}
                  transitions={transitions}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteClick}
                  onAddChild={(parentId) => {
                    setParentId(parentId);
                    setCreateDialogOpen(true);
                  }}
                  onAddTransition={handleAddTransition}
                  onDeleteTransition={handleDeleteTransition}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ItemFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateItem}
        isSubmitting={createItem.isPending}
      />

      <ItemFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={editingItem ?? undefined}
        onSubmit={handleUpdateItem}
        isSubmitting={updateItem.isPending}
      />

      <TransitionDialog
        open={transitionDialogOpen}
        onOpenChange={setTransitionDialogOpen}
        fromItemId={transitionFromItemId ?? ""}
        allItems={allItems}
        transitions={transitions}
        onSubmit={handleCreateTransition}
        onDelete={handleDeleteTransition}
        isSubmitting={createTransition.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? All children and
              transitions will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingItem(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteItem.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteItem.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
