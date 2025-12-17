import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useGameItems } from "@/hooks/game/useGameItems";
import { useGameTransitions } from "@/hooks/game/useGameTransitions";
import { useCreateGameItem } from "@/hooks/game/useCreateGameItem";
import { useUpdateGameItem } from "@/hooks/game/useUpdateGameItem";
import { useDeleteGameItem } from "@/hooks/game/useDeleteGameItem";
import { useCreateGameTransition } from "@/hooks/game/useCreateGameTransition";
import { useDeleteGameTransition } from "@/hooks/game/useDeleteGameTransition";
import { useUpdateGameTransition } from "@/hooks/game/useUpdateGameTransition";
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
  allItems,
  showTransitions = true,
  onEdit,
  onDelete,
  onView,
  onAddChild,
  onAddTransition,
  onDeleteTransition,
}: {
  item: GameItem;
  level?: number;
  transitions: GameTransition[];
  allItems: GameItem[];
  showTransitions?: boolean;
  onEdit: (item: GameItem) => void;
  onDelete: (item: GameItem) => void;
  onView: (item: GameItem) => void;
  onAddChild: (parentId: string) => void;
  onAddTransition: (fromItemId: string) => void;
  onDeleteTransition: (transitionId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = (item.children?.length ?? 0) > 0;
  const outgoingTransitions = transitions.filter(
    (t) => t.fromItemId === item.id
  );
  const incomingTransitions = transitions.filter((t) => t.toItemId === item.id);
  const hasTransitions =
    outgoingTransitions.length > 0 || incomingTransitions.length > 0;
  const shouldShowChevron = hasChildren || (showTransitions && hasTransitions);

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent transition-colors"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        {shouldShowChevron ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <div className="h-6 w-6 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{item.name}</span>
            {showTransitions && hasTransitions && (
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {outgoingTransitions.length} to · {incomingTransitions.length}{" "}
                from
              </span>
            )}
          </div>
          {item.notes && (
            <p className="text-muted-foreground text-sm mt-0.5 truncate">
              {item.notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild(item.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Child
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTransition(item.id)}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Add Transition
              </DropdownMenuItem>
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
      </div>
      {shouldShowChevron && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div
              className="space-y-3 pt-2 pb-1"
              style={{ paddingLeft: `${level * 1.5 + 1.5}rem` }}
            >
              {showTransitions && hasTransitions && (
                <div className="space-y-3 pb-2 border-b border-border/50">
                  {outgoingTransitions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <ArrowRight className="h-3 w-3" />
                        To:
                      </div>
                      <div className="space-y-1.5 pl-4">
                        {outgoingTransitions.map((transition) => {
                          const toItem = allItems.find(
                            (item) => item.id === transition.toItemId
                          );
                          return (
                            <div
                              key={transition.id}
                              className="text-sm text-foreground"
                            >
                              <div className="font-medium">
                                {toItem?.name ?? "Unknown"}
                              </div>
                              {transition.notes && (
                                <p className="text-muted-foreground text-xs mt-0.5">
                                  {transition.notes}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {incomingTransitions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <ArrowLeft className="h-3 w-3" />
                        From:
                      </div>
                      <div className="space-y-1.5 pl-4">
                        {incomingTransitions.map((transition) => {
                          const fromItem = allItems.find(
                            (item) => item.id === transition.fromItemId
                          );
                          return (
                            <div
                              key={transition.id}
                              className="text-sm text-foreground"
                            >
                              <div className="font-medium">
                                {fromItem?.name ?? "Unknown"}
                              </div>
                              {transition.notes && (
                                <p className="text-muted-foreground text-xs mt-0.5">
                                  {transition.notes}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {hasChildren && (
                <div className="space-y-1">
                  {item.children!.map((child) => (
                    <GameItemRow
                      key={child.id}
                      item={child}
                      level={level + 1}
                      transitions={transitions}
                      allItems={allItems}
                      showTransitions={showTransitions}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                      onAddChild={onAddChild}
                      onAddTransition={onAddTransition}
                      onDeleteTransition={onDeleteTransition}
                    />
                  ))}
                </div>
              )}
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

function ViewItemDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GameItem | null;
}) {
  if (!item) return null;

  function renderChildren(children: GameItem[], level = 0) {
    if (!children || children.length === 0) return null;

    return (
      <div className="space-y-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
        {children.map((child) => (
          <div key={child.id} className="border-l-2 border-border pl-4 py-2">
            <div className="font-medium">{child.name}</div>
            {child.notes && (
              <p className="text-muted-foreground text-sm mt-1">
                {child.notes}
              </p>
            )}
            {child.children && child.children.length > 0 && (
              <div className="mt-2">
                {renderChildren(child.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {item.notes && (
            <div>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {item.notes}
              </p>
            </div>
          )}
          {item.children && item.children.length > 0 && (
            <div>
              <ScrollArea className="max-h-96 rounded-md border p-4">
                {renderChildren(item.children)}
              </ScrollArea>
            </div>
          )}
          {(!item.notes || item.notes.trim().length === 0) &&
            (!item.children || item.children.length === 0) && (
              <p className="text-muted-foreground text-sm">
                No additional details available.
              </p>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
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
  onUpdate,
  onDelete,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromItemId: string;
  allItems: GameItem[];
  transitions: GameTransition[];
  onSubmit: (toItemId: string, notes?: string | null) => void;
  onUpdate: (transitionId: string, notes?: string | null) => void;
  onDelete: (transitionId: string) => void;
  isSubmitting: boolean;
}) {
  const [toItemId, setToItemId] = useState("");
  const [notes, setNotes] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [editingTransitionId, setEditingTransitionId] = useState<string | null>(
    null
  );
  const [editNotes, setEditNotes] = useState("");

  const fromItem = allItems.find((item) => item.id === fromItemId);
  const outgoingTransitions = transitions.filter(
    (t) => t.fromItemId === fromItemId
  );
  const incomingTransitions = transitions.filter(
    (t) => t.toItemId === fromItemId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (toItemId) {
      onSubmit(toItemId, notes.trim() || null);
      setToItemId("");
      setNotes("");
    }
  };

  const handleStartEdit = (transition: GameTransition) => {
    setEditingTransitionId(transition.id);
    setEditNotes(transition.notes ?? "");
  };

  const handleSaveEdit = (transitionId: string) => {
    onUpdate(transitionId, editNotes.trim() || null);
    setEditingTransitionId(null);
    setEditNotes("");
  };

  const handleCancelEdit = () => {
    setEditingTransitionId(null);
    setEditNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Transitions {fromItem ? `from ${fromItem.name}` : ""}
          </DialogTitle>
          <DialogDescription>
            Define when and how you move from this position to others
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Outgoing Transitions
              </Label>
              {outgoingTransitions.length === 0 ? (
                <p className="text-muted-foreground text-sm pl-6">
                  No outgoing transitions yet. Add one below.
                </p>
              ) : (
                <ScrollArea
                  className={`${
                    editingTransitionId &&
                    outgoingTransitions.some(
                      (t) => t.id === editingTransitionId
                    )
                      ? "h-64"
                      : "h-40"
                  } rounded-md border p-4`}
                >
                  <div className="space-y-2">
                    {outgoingTransitions.map((transition) => {
                      const toItem = allItems.find(
                        (item) => item.id === transition.toItemId
                      );
                      const isEditing = editingTransitionId === transition.id;
                      return (
                        <div
                          key={transition.id}
                          className="flex items-start justify-between rounded-md border p-3 bg-card"
                        >
                          {isEditing ? (
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 shrink-0" />
                                <span className="font-medium">
                                  {toItem?.name ?? "Unknown"}
                                </span>
                              </div>
                              <Textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Add notes about this transition..."
                                rows={2}
                                maxLength={1000}
                                className="resize-none text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(transition.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <ArrowRight className="h-4 w-4 shrink-0" />
                                  <span className="font-medium">
                                    {toItem?.name ?? "Unknown"}
                                  </span>
                                </div>
                                {transition.notes && (
                                  <p className="text-muted-foreground text-sm mt-1 ml-6">
                                    {transition.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStartEdit(transition)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => onDelete(transition.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Incoming Transitions
              </Label>
              {incomingTransitions.length === 0 ? (
                <p className="text-muted-foreground text-sm pl-6">
                  No incoming transitions.
                </p>
              ) : (
                <ScrollArea
                  className={`${
                    editingTransitionId &&
                    incomingTransitions.some(
                      (t) => t.id === editingTransitionId
                    )
                      ? "h-64"
                      : "h-40"
                  } rounded-md border p-4`}
                >
                  <div className="space-y-2">
                    {incomingTransitions.map((transition) => {
                      const fromItem = allItems.find(
                        (item) => item.id === transition.fromItemId
                      );
                      const isEditing = editingTransitionId === transition.id;
                      return (
                        <div
                          key={transition.id}
                          className="flex items-start justify-between rounded-md border p-3 bg-card"
                        >
                          {isEditing ? (
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4 shrink-0" />
                                <span className="font-medium">
                                  {fromItem?.name ?? "Unknown"}
                                </span>
                              </div>
                              <Textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Add notes about this transition..."
                                rows={2}
                                maxLength={1000}
                                className="resize-none text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(transition.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <ArrowLeft className="h-4 w-4 shrink-0" />
                                  <span className="font-medium">
                                    {fromItem?.name ?? "Unknown"}
                                  </span>
                                </div>
                                {transition.notes && (
                                  <p className="text-muted-foreground text-sm mt-1 ml-6">
                                    {transition.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStartEdit(transition)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => onDelete(transition.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="toItem">Add Outgoing Transition</Label>
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
                      {allItems
                        .filter((item) => item.id !== fromItemId)
                        .map((item) => (
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GameItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GameItem | null>(null);
  const [viewingItem, setViewingItem] = useState<GameItem | null>(null);
  const [transitionFromItemId, setTransitionFromItemId] = useState<
    string | null
  >(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [showTransitions, setShowTransitions] = useState(true);

  const { data: itemsData, isLoading: itemsLoading } = useGameItems();
  const { data: transitionsData } = useGameTransitions();

  const createItem = useCreateGameItem();
  const updateItem = useUpdateGameItem();
  const deleteItem = useDeleteGameItem();
  const createTransition = useCreateGameTransition();
  const updateTransition = useUpdateGameTransition();
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

  const handleUpdateTransition = (
    transitionId: string,
    notes?: string | null
  ) => {
    updateTransition.mutate({
      id: transitionId,
      input: { notes: notes ?? null },
    });
  };

  const handleDeleteTransition = (transitionId: string) => {
    deleteTransition.mutate(transitionId);
  };

  const handleViewItem = (item: GameItem) => {
    setViewingItem(item);
    setViewDialogOpen(true);
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
          <div className="flex items-center justify-between">
            <CardTitle>Positions & Techniques</CardTitle>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="show-transitions"
                className="text-sm font-normal cursor-pointer"
              >
                Show Transitions
              </Label>
              <button
                id="show-transitions"
                type="button"
                onClick={() => setShowTransitions(!showTransitions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showTransitions ? "bg-primary" : "bg-muted"
                }`}
                role="switch"
                aria-checked={showTransitions}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showTransitions ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
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
                  allItems={allItems}
                  showTransitions={showTransitions}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteClick}
                  onView={handleViewItem}
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
        key={createDialogOpen ? `create-${parentId ?? "root"}` : "closed"}
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
        onUpdate={handleUpdateTransition}
        onDelete={handleDeleteTransition}
        isSubmitting={createTransition.isPending}
      />

      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) {
            setViewingItem(null);
          }
        }}
        item={viewingItem}
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
