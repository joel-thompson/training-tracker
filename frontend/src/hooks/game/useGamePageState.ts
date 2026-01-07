import { useState } from "react";
import { useGameItems } from "./useGameItems";
import { useGameTransitions } from "./useGameTransitions";
import { useCreateGameItem } from "./useCreateGameItem";
import { useUpdateGameItem } from "./useUpdateGameItem";
import { useDeleteGameItem } from "./useDeleteGameItem";
import { useReorderGameItem } from "./useReorderGameItem";
import { useCreateGameTransition } from "./useCreateGameTransition";
import { useUpdateGameTransition } from "./useUpdateGameTransition";
import { useDeleteGameTransition } from "./useDeleteGameTransition";
import type { GameItem } from "shared/types";

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

function findItemInTree(tree: GameItem[], id: string): GameItem | undefined {
  for (const item of tree) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItemInTree(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function useGamePageState() {
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
  const [showTransitions, setShowTransitions] = useState(false);
  const [moveToDialogOpen, setMoveToDialogOpen] = useState(false);
  const [movingItem, setMovingItem] = useState<GameItem | null>(null);

  const { data: itemsData, isLoading: itemsLoading } = useGameItems();
  const { data: transitionsData } = useGameTransitions();

  const createItem = useCreateGameItem();
  const updateItem = useUpdateGameItem();
  const deleteItem = useDeleteGameItem();
  const reorderItem = useReorderGameItem();
  const createTransition = useCreateGameTransition();
  const updateTransition = useUpdateGameTransition();
  const deleteTransition = useDeleteGameTransition();

  const items = itemsData?.items ?? [];
  const transitions = transitionsData?.transitions ?? [];
  const allItems = flattenItems(items);

  function getSiblings(item: GameItem): GameItem[] {
    const parentId = item.parentId;
    if (parentId === null) {
      return items;
    }
    const parent = findItemInTree(items, parentId);
    return parent?.children ?? [];
  }

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

  const handleMoveTo = (item: GameItem) => {
    setMovingItem(item);
    setMoveToDialogOpen(true);
  };

  const handleMoveToSubmit = (parentId: string | null) => {
    if (movingItem) {
      updateItem.mutate(
        {
          id: movingItem.id,
          input: { parentId },
        },
        {
          onSuccess: () => {
            setMoveToDialogOpen(false);
            setMovingItem(null);
          },
        }
      );
    }
  };

  const handleMoveUp = (item: GameItem) => {
    reorderItem.mutate({ id: item.id, direction: "up" });
  };

  const handleMoveDown = (item: GameItem) => {
    reorderItem.mutate({ id: item.id, direction: "down" });
  };

  return {
    // State
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    transitionDialogOpen,
    setTransitionDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    moveToDialogOpen,
    setMoveToDialogOpen,
    editingItem,
    deletingItem,
    setDeletingItem,
    viewingItem,
    setViewingItem,
    movingItem,
    setMovingItem,
    transitionFromItemId,
    parentId,
    setParentId,
    showTransitions,
    setShowTransitions,
    // Data
    items,
    transitions,
    allItems,
    itemsLoading,
    // Mutations
    createItem,
    updateItem,
    deleteItem,
    reorderItem,
    createTransition,
    updateTransition,
    deleteTransition,
    // Handlers
    handleCreateItem,
    handleEditItem,
    handleUpdateItem,
    handleDeleteClick,
    handleDeleteConfirm,
    handleAddTransition,
    handleCreateTransition,
    handleUpdateTransition,
    handleDeleteTransition,
    handleViewItem,
    handleMoveTo,
    handleMoveToSubmit,
    handleMoveUp,
    handleMoveDown,
    // Helpers
    getSiblings,
  };
}

