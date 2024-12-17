import { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";

interface SelectionContextType {
  selectedItems: Set<string>;
  isSelecting: boolean;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  deleteSelectedItems: () => Promise<void>;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const deleteSelectedItems = async () => {
    try {
      const promises = Array.from(selectedItems).map((id) => fetch(`/api/drafts?id=${id}`, { method: "DELETE" }));

      await Promise.all(promises);
      toast.success(`Deleted ${selectedItems.size} drafts`);
      clearSelection();
    } catch (_error) {
      toast.error("Failed to delete selected drafts");
    }
  };

  const value = {
    selectedItems,
    isSelecting: selectedItems.size > 0,
    toggleSelection,
    clearSelection,
    deleteSelectedItems,
  };

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelectionContext() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error("useSelectionContext must be used within a SelectionProvider");
  }
  return context;
}
