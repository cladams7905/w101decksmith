import { useState, useCallback, useRef, useMemo } from "react";

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

  // Memoize mouse down handler with optimized state updates
  const handleMouseDown = useCallback(
    (index: number, event: React.MouseEvent) => {
      event.preventDefault();
      setIsDragging(true);
      setDragStartIndex(index);

      // Determine if we're selecting or deselecting based on current state
      setSelectedSlots((prev) => {
        const isCurrentlySelected = prev.has(index);
        dragModeRef.current = isCurrentlySelected ? "deselect" : "select";

        const newSet = new Set(prev);
        if (isCurrentlySelected) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    },
    [] // No external dependencies needed
  );

  // Memoize mouse enter handler with optimized state updates
  const handleMouseEnter = useCallback(
    (index: number) => {
      if (!isDragging || dragStartIndex === null) return;

      const startIndex = Math.min(dragStartIndex, index);
      const endIndex = Math.max(dragStartIndex, index);

      setSelectedSlots((prev) => {
        const newSet = new Set(prev);

        // Clear previous selection in drag range - optimized logic
        // Keep existing selections outside drag range unchanged

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

  // Memoize mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartIndex(null);
    dragModeRef.current = null;
  }, []);

  // Memoize clear selection handler with stable empty Set
  const clearSelection = useCallback(() => {
    setSelectedSlots(new Set());
  }, []);

  // Memoize the return object to prevent unnecessary rerenders
  const returnValue = useMemo(
    () => ({
      selectedSlots,
      isDragging,
      handleMouseDown,
      handleMouseEnter,
      handleMouseUp,
      clearSelection
    }),
    [
      selectedSlots,
      isDragging,
      handleMouseDown,
      handleMouseEnter,
      handleMouseUp,
      clearSelection
    ]
  );

  return returnValue;
}
