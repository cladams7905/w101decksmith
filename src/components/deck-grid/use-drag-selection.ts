import { useState, useCallback, useRef } from "react";

interface UseDragSelectionReturn {
  selectedSlots: Set<number>;
  isDragging: boolean;
  handleMouseDown: (index: number, event: React.MouseEvent) => void;
  handleMouseEnter: (index: number) => void;
  handleMouseUp: () => void;
  clearSelection: () => void;
}

export function useDragSelection(): UseDragSelectionReturn {
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const dragModeRef = useRef<"select" | "deselect" | null>(null);

  const handleMouseDown = useCallback(
    (index: number, event: React.MouseEvent) => {
      event.preventDefault();
      setIsDragging(true);
      setDragStartIndex(index);

      // Determine if we're selecting or deselecting based on current state
      const isCurrentlySelected = selectedSlots.has(index);
      dragModeRef.current = isCurrentlySelected ? "deselect" : "select";

      setSelectedSlots((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlySelected) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    },
    [selectedSlots]
  );

  const handleMouseEnter = useCallback(
    (index: number) => {
      if (!isDragging || dragStartIndex === null) return;

      const startIndex = Math.min(dragStartIndex, index);
      const endIndex = Math.max(dragStartIndex, index);

      setSelectedSlots((prev) => {
        const newSet = new Set(prev);

        // Clear previous selection in drag range
        for (let i = 0; i < 64; i++) {
          if (i >= startIndex && i <= endIndex) continue;
          if (dragModeRef.current === "select") {
            // Keep existing selections outside drag range
          } else {
            // Keep existing selections outside drag range
          }
        }

        // Apply selection/deselection to drag range
        for (let i = startIndex; i <= endIndex; i++) {
          if (dragModeRef.current === "select") {
            newSet.add(i);
          } else {
            newSet.delete(i);
          }
        }

        return newSet;
      });
    },
    [isDragging, dragStartIndex]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartIndex(null);
    dragModeRef.current = null;
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSlots(new Set());
  }, []);

  return {
    selectedSlots,
    isDragging,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    clearSelection
  };
}
