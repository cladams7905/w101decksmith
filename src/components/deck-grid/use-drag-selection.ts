import { gridLogger } from "@/lib/logger";
import { useState, useCallback, useRef, useMemo, useEffect } from "react";

// Helper function for efficient Set comparison
function areSetsEqual<T>(a: Set<T>, b: Set<T>) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

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

  // Add throttling to prevent excessive state updates during drag
  const updateThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSelectionRef = useRef<Set<number> | null>(null);

  // Helper function to get all slots between two positions (treating grid as continuous sequence)
  const getSlotsBetween = useCallback(
    (fromSlot: number, toSlot: number): number[] => {
      // Ensure we have the correct order (smallest to largest)
      const startSlot = Math.min(fromSlot, toSlot);
      const endSlot = Math.max(fromSlot, toSlot);

      // Generate all slots in the range (inclusive)
      const slots: number[] = [];
      for (let i = startSlot; i <= endSlot; i++) {
        slots.push(i);
      }

      gridLogger.debug(
        `🔥 Range selection: slots ${startSlot} to ${endSlot} = [${slots.join(
          ", "
        )}]`
      );

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
          // Capture the current selection state at the start of drag using functional update
          setSelectedSlots((current) => {
            initialSelectionRef.current = new Set(current);
            return current; // Don't change state, just capture it - no new object created
          });
        }
      }

      // Continue with normal drag logic only if we're actually dragging
      if (!isDragging && !hasDraggedRef.current) {
        return;
      }

      // Process with throttling to reduce rerenders during drag
      const updateSelection = (newSelection: Set<number>) => {
        pendingSelectionRef.current = newSelection;

        if (updateThrottleRef.current) {
          clearTimeout(updateThrottleRef.current);
        }

        updateThrottleRef.current = setTimeout(() => {
          const selectionToUpdate = pendingSelectionRef.current;
          if (selectionToUpdate) {
            setSelectedSlots((prev) => {
              // Use efficient Set comparison
              const hasChanged = !areSetsEqual(selectionToUpdate, prev);

              gridLogger.debug(
                `🔥 Throttled update - Selection changed: ${hasChanged}`
              );
              if (hasChanged) {
                gridLogger.debug(
                  `🔥 Final selection:`,
                  Array.from(selectionToUpdate)
                );
              }

              return hasChanged ? selectionToUpdate : prev;
            });
          }
          updateThrottleRef.current = null;
          pendingSelectionRef.current = null;
        }, 16); // ~60fps throttling
      };

      // Calculate new selection immediately for consistency
      const fromSlot =
        initialSlotRef.current !== null ? initialSlotRef.current : index;
      const slotsInPath = getSlotsBetween(fromSlot, index);

      gridLogger.debug(`🔥 Drag: from slot ${fromSlot} to ${index}`);
      gridLogger.debug(`🔥 Path slots:`, slotsInPath);

      // Start with the initial selection state
      const newSelection = new Set(initialSelectionRef.current);

      // Determine the action based on the initial slot's state
      const initialSlotSelected = initialSelectionRef.current.has(fromSlot);
      const targetState = !initialSlotSelected;

      gridLogger.debug(
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

      // Update with throttling
      updateSelection(newSelection);
    },
    [isDragging, getSlotsBetween]
  );

  const handleMouseUp = useCallback(() => {
    const wasDragging = hasDraggedRef.current;

    // Clear any pending throttled updates
    if (updateThrottleRef.current) {
      clearTimeout(updateThrottleRef.current);
      updateThrottleRef.current = null;
    }
    pendingSelectionRef.current = null;

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
