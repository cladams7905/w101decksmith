import { useState, useCallback, useRef, useMemo, useEffect } from "react";

interface UseDragSelectionReturn {
  selectedSlots: Set<number>;
  isDragging: boolean;
  shouldDisableTooltips: boolean;
  handleMouseDown: (index: number, event: React.MouseEvent) => void;
  handleMouseEnter: (index: number) => void;
  handleMouseUp: () => boolean;
  handleClick: (index: number) => void;
  clearSelection: () => void;
}

export function useDragSelection(): UseDragSelectionReturn {
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [shouldDisableTooltips, setShouldDisableTooltips] = useState(false);

  // Simple refs to track drag state
  const initialSelectionRef = useRef<Set<number>>(new Set());
  const dragModeRef = useRef<"add" | "remove" | "toggle" | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedSlotRef = useRef<number | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mouse movement to distinguish clicks from drags
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const initialSlotRef = useRef<number | null>(null);
  const lastDragSlotRef = useRef<number | null>(null);

  // Helper function to get all slots between two positions (including diagonals)
  const getSlotsBetween = useCallback(
    (fromSlot: number, toSlot: number): number[] => {
      if (fromSlot === toSlot) return [toSlot];

      // Convert slot indices to grid coordinates (8x8 grid)
      const fromRow = Math.floor(fromSlot / 8);
      const fromCol = fromSlot % 8;
      const toRow = Math.floor(toSlot / 8);
      const toCol = toSlot % 8;

      const slots: number[] = [];

      // Calculate the number of steps needed
      const rowDiff = toRow - fromRow;
      const colDiff = toCol - fromCol;
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

      // If no steps needed, just return the target slot
      if (steps === 0) return [toSlot];

      // Calculate step increments
      const rowStep = steps === 0 ? 0 : rowDiff / steps;
      const colStep = steps === 0 ? 0 : colDiff / steps;

      // Generate all slots along the path
      for (let i = 0; i <= steps; i++) {
        const currentRow = Math.round(fromRow + rowStep * i);
        const currentCol = Math.round(fromCol + colStep * i);

        // Ensure we stay within grid bounds
        if (
          currentRow >= 0 &&
          currentRow < 8 &&
          currentCol >= 0 &&
          currentCol < 8
        ) {
          const slotIndex = currentRow * 8 + currentCol;
          if (!slots.includes(slotIndex)) {
            slots.push(slotIndex);
          }
        }
      }

      return slots;
    },
    []
  );

  // Handle tooltip disabling
  useEffect(() => {
    if (isDragging) {
      setShouldDisableTooltips(true);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }
    } else {
      // Delay re-enabling tooltips after drag ends
      tooltipTimeoutRef.current = setTimeout(() => {
        setShouldDisableTooltips(false);
      }, 200);
    }

    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [isDragging]);

  const handleMouseDown = useCallback(
    (index: number, event: React.MouseEvent) => {
      event.preventDefault();

      // Track initial mouse position and state
      mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
      hasDraggedRef.current = false;
      isMouseDownRef.current = true;
      initialSlotRef.current = index; // Remember which slot we started on

      // Start with potential drag but don't commit to selection change yet
      dragModeRef.current = "toggle";

      // We'll only modify selection when we confirm it's a drag or on mouse up
    },
    []
  );

  const handleMouseEnter = useCallback(
    (index: number) => {
      // Only process if mouse is down (potential drag)
      if (!isMouseDownRef.current || dragModeRef.current === null) {
        return;
      }

      // If this is the first mouse enter after mouse down, mark as dragged
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        setIsDragging(true);

        // Set the initial slot as our last drag position but don't modify selection yet
        if (initialSlotRef.current !== null) {
          lastDragSlotRef.current = initialSlotRef.current;
          initialSelectionRef.current = new Set(selectedSlots);
        }
      }

      // Continue with normal drag logic only if we're actually dragging
      if (!isDragging && !hasDraggedRef.current) {
        return;
      }

      // Process immediately without debounce to fix lag
      setSelectedSlots(() => {
        // Get all slots from initial position to current position
        const fromSlot =
          initialSlotRef.current !== null ? initialSlotRef.current : index;
        const slotsInPath = getSlotsBetween(fromSlot, index);

        console.log(`🔥 Drag: from slot ${fromSlot} to ${index}`);
        console.log(`🔥 Path slots:`, slotsInPath);

        // Start with the initial selection state
        const newSelection = new Set(initialSelectionRef.current);

        // Determine the action based on the initial slot's state
        const initialSlotSelected = initialSelectionRef.current.has(fromSlot);
        const targetState = !initialSlotSelected; // If initial was selected, we're deselecting; if not, we're selecting

        console.log(
          `🔥 Initial slot ${fromSlot} was selected: ${initialSlotSelected}, target state: ${targetState}`
        );

        // Apply consistent state to all slots in the path
        slotsInPath.forEach((slotIndex) => {
          if (targetState) {
            newSelection.add(slotIndex);
          } else {
            newSelection.delete(slotIndex);
          }
        });

        console.log(`🔥 Final selection:`, Array.from(newSelection));

        return newSelection;
      });
    },
    [isDragging, getSlotsBetween, selectedSlots]
  );

  const handleMouseUp = useCallback(() => {
    const wasDragging = hasDraggedRef.current;

    // Reset all drag state
    setIsDragging(false);
    dragModeRef.current = null;
    initialSelectionRef.current = new Set();
    lastProcessedSlotRef.current = null;
    isMouseDownRef.current = false;
    mouseDownPosRef.current = null;
    hasDraggedRef.current = false;
    initialSlotRef.current = null;
    lastDragSlotRef.current = null;

    // Clean up any pending timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    // Return whether this was a drag or just a click
    return wasDragging;
  }, []);

  const handleClick = useCallback((index: number) => {
    // Handle single click selection toggle when not dragging
    setSelectedSlots((current) => {
      const isCurrentlySelected = current.has(index);
      const newSelection = new Set(current);

      if (isCurrentlySelected) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }

      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSlots(new Set());
  }, []);

  return useMemo(
    () => ({
      selectedSlots,
      isDragging,
      shouldDisableTooltips,
      handleMouseDown,
      handleMouseEnter,
      handleMouseUp,
      handleClick,
      clearSelection
    }),
    [
      selectedSlots,
      isDragging,
      shouldDisableTooltips,
      handleMouseDown,
      handleMouseEnter,
      handleMouseUp,
      handleClick,
      clearSelection
    ]
  );
}
