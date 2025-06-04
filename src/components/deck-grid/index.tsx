"use client";

import type { Deck, Spell } from "@/lib/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DeckGridSlot } from "./deck-grid-slot";
import { useDeckGrid } from "./use-deck-grid";
import { useDragSelection } from "./use-drag-selection";
import SpellSearchPopup from "@/components/deck-grid/spell-search-popup";
import { useCallback, useEffect, useMemo, memo, useRef, useState } from "react";
// import { gridLogger } from "@/lib/logger";

interface DeckGridProps {
  deck: Deck;
  onAddSpell: (spell: Spell, index: number, quantity: number) => void;
  onReplaceSpell: (spellName: string, newSpell: Spell, index: number) => void;
  onRemoveSpell?: (index: number) => void;
  onBulkRemoveSpells?: (indices: number[]) => void;
  onBulkReplaceSpells?: (spell: Spell, indices: number[]) => void;
  onBulkAddSpells?: (spell: Spell, positions: number[]) => void;
  onMixedOperation?: (
    spell: Spell,
    replaceIndices: number[],
    addCount: number
  ) => void;
}

const DeckGrid = memo(function DeckGrid({
  deck,
  onAddSpell,
  onReplaceSpell,
  onRemoveSpell,
  onBulkRemoveSpells,
  onMixedOperation
}: DeckGridProps) {
  // Memoize grid creation - only recreate when deck.spells changes
  const grid = useMemo(() => {
    const rows = 8;
    const cols = 8;
    const newGrid: (Spell | null)[] = Array(rows * cols).fill(null);

    // Fill the grid with spells from the deck
    (deck.spells as Spell[]).forEach((spell, index) => {
      if (index < newGrid.length) {
        newGrid[index] = spell;
      }
    });

    return newGrid;
  }, [deck.spells]);

  // Debug: Log when deck changes
  useEffect(() => {
    // gridLogger.debug("Deck changed, grid should re-render:", {
    //   deckLength: deck.spells.length,
    //   spells: deck.spells.map((s, i) => ({
    //     index: i,
    //     name: s.name,
    //     id: s.name,
    //     tier: s.tier
    //   }))
    // });
  }, [deck.spells]);

  // Memoize multi-slot operation handler to prevent recreation on every render
  const handleMultiSlotOperation = useCallback(
    (spell: Spell, slots: number[], currentGrid: (Spell | null)[]) => {
      // gridLogger.group("Grid vs deck alignment debugging");
      // gridLogger.debug("Selected slots:", slots);
      // gridLogger.debug(
      //   "Current deck:",
      //   deck.spells.map((s, i) => ({ deckIndex: i, name: s.name, id: s.name }))
      // );
      // gridLogger.debug(
      //   "Grid state for selected slots:",
      //   slots.map((gridIndex) => ({
      //     gridIndex,
      //     spell: currentGrid[gridIndex]?.name || "empty",
      //     id: currentGrid[gridIndex]?.name || null
      //   }))
      // );

      const replaceIndices: number[] = [];
      let addCount = 0;

      slots.forEach((gridIndex) => {
        if (currentGrid[gridIndex]) {
          replaceIndices.push(gridIndex);
        } else {
          addCount++;
        }
      });

      // gridLogger.debug("Operation breakdown:", {
      //   replaceIndices,
      //   addCount,
      //   totalSlots: slots.length
      // });

      if (onMixedOperation) {
        // gridLogger.debug("Using mixed operation handler");
        onMixedOperation(spell, replaceIndices, addCount);
      } else {
        // gridLogger.debug("Falling back to individual operations");
        // Handle replacements
        replaceIndices.forEach((gridIndex) => {
          const existingSpell = currentGrid[gridIndex];
          if (existingSpell) {
            onReplaceSpell(existingSpell.name, spell, gridIndex);
          }
        });

        // Handle additions
        for (let i = 0; i < addCount; i++) {
          onAddSpell(spell, (deck.spells as Spell[]).length + i, 1);
        }
      }

      // gridLogger.groupEnd();
    },
    [deck.spells, onMixedOperation, onReplaceSpell, onAddSpell]
  );

  const {
    activeSlot,
    popupPosition,
    isReplacing,
    handleEmptySlotClick,
    handleSelectSpell,
    closePopup,
    setActiveSlot,
    setPopupPosition,
    setIsReplacing
  } = useDeckGrid({
    onAddSpell,
    onReplaceSpell,
    onRemoveSpell,
    onMultiSlotOperation: handleMultiSlotOperation
  });

  const {
    selectedSlots,
    isDragging,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    clearSelection
  } = useDragSelection();

  // Memoize drag completion handler - avoid selectedSlots dependency
  const handleDragComplete = useCallback(() => {
    // Use ref to get current selection without state dependency
    const currentSelection = selectedSlotsRef.current;

    // Show popup if we have selected slots after drag
    if (currentSelection.size > 0) {
      // Check if we have any filled slots in the selection
      const selectedSlotIndices = Array.from(currentSelection);
      const hasFilledSlots = selectedSlotIndices.some(
        (index) => grid[index] !== null
      );
      const hasEmptySlots = selectedSlotIndices.some(
        (index) => grid[index] === null
      );

      // Position popup in center of screen with proper bounds checking
      const popupWidth = 320;
      const popupEstimatedHeight = 400; // Realistic estimate instead of max height

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Center horizontally and vertically with bounds checking
      let left = centerX - popupWidth / 2;
      let top = centerY - popupEstimatedHeight / 2;

      // Ensure popup stays within viewport bounds
      left = Math.max(10, Math.min(left, window.innerWidth - popupWidth - 10));
      top = Math.max(
        10,
        Math.min(top, window.innerHeight - popupEstimatedHeight - 10)
      );

      setPopupPosition({ top, left });
      setActiveSlot(selectedSlotIndices[0]); // Use first selected slot as reference

      // Set mode based on selection content
      // If we have both filled and empty slots, we'll handle this as a mixed operation
      // If only filled slots, it's a replace operation
      // If only empty slots, it's an add operation
      setIsReplacing(hasFilledSlots && !hasEmptySlots);
    }
  }, [grid, setPopupPosition, setActiveSlot, setIsReplacing]); // No selectedSlots dependency!

  // Memoize global mouse up handler
  const handleGlobalMouseUp = useCallback(() => {
    if (isDragging) {
      const wasDrag = handleMouseUp();
      if (wasDrag) {
        handleDragComplete();
      }
    }
  }, [isDragging, handleMouseUp, handleDragComplete]);

  // Add global mouse up listener for drag selection
  useEffect(() => {
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [handleGlobalMouseUp]);

  // Memoize single slot click handler - only depend on functions, not state
  const handleSlotClick = useCallback(
    (index: number, event: React.MouseEvent) => {
      // Check selection dynamically without depending on it
      if (selectedSlotsRef.current.size > 0) {
        clearSelection();
        return;
      }

      // Normal single slot operation when no selections exist
      if (grid[index]) {
        // Single click on filled slot - remove and shift
        if (onRemoveSpell) {
          onRemoveSpell(index);
        }
      } else {
        // Single click on empty slot - open spell search popup
        handleEmptySlotClick(index, event);
      }
    },
    [grid, handleEmptySlotClick, clearSelection, onRemoveSpell]
  );

  // Handle clicking outside to clear selection - use refs to avoid selectedSlots dependency
  const selectedSlotsRef = useRef<Set<number>>(new Set());

  // Keep selectedSlotsRef in sync with selectedSlots state
  useEffect(() => {
    selectedSlotsRef.current = selectedSlots;
  }, [selectedSlots]);

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      // Use ref to check selections without depending on selectedSlots state
      if (selectedSlotsRef.current.size > 0 && !isDragging) {
        const target = event.target as Element;
        // Check if click is outside both the deck grid AND the spell search popup
        if (
          !target.closest(".deck-grid") &&
          !target.closest("[data-spell-search-popup]")
        ) {
          clearSelection(); // Use hook's clearSelection
        }
      }
    },
    [isDragging, clearSelection] // Minimal dependencies
  );

  // Add outside click listener
  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [handleOutsideClick]);

  // Memoize spell selection handler - avoid selectedSlots dependency
  const handleSpellSelection = useCallback(
    (spell: Spell, quantity: number) => {
      // Always use the current grid state, not the captured one
      const currentGrid: (Spell | null)[] = Array(64).fill(null);
      (deck.spells as Spell[]).forEach((deckSpell, index) => {
        if (index < currentGrid.length) {
          currentGrid[index] = deckSpell;
        }
      });

      // Use ref to get current selection without dependency
      handleSelectSpell(
        spell,
        quantity,
        selectedSlotsRef.current,
        currentGrid,
        clearSelection
      );
    },
    [deck.spells, handleSelectSpell, clearSelection] // No selectedSlots dependency!
  );

  // Memoize delete selected spells handler - avoid selectedSlots dependency
  const handleDeleteSelectedSpells = useCallback(() => {
    const currentSelection = selectedSlotsRef.current;
    if (currentSelection.size > 0) {
      // Get indices of slots that have spells
      const indicesToRemove = Array.from(currentSelection).filter(
        (slotIndex: number) => grid[slotIndex] !== null
      );

      if (indicesToRemove.length > 0) {
        if (onBulkRemoveSpells && indicesToRemove.length > 1) {
          // Use bulk remove for multiple deletions
          onBulkRemoveSpells(indicesToRemove);
        } else if (onRemoveSpell) {
          // Use single remove for one deletion
          indicesToRemove.forEach((slotIndex) => {
            onRemoveSpell(slotIndex);
          });
        }
      }

      clearSelection();
    }
  }, [grid, onBulkRemoveSpells, onRemoveSpell, clearSelection]); // No selectedSlots dependency!

  // Handle popup close - clear selections when popup closes
  const handlePopupClose = useCallback(() => {
    closePopup();
    clearSelection();
  }, [closePopup, clearSelection]);

  // Memoize computed values for popup
  const availableSlots = useMemo(
    () => 64 - (deck.spells as Spell[]).length,
    [deck.spells]
  );

  // Delete handler - use ref to check without dependency
  const deleteHandler = useMemo(() => {
    // We can't avoid re-computing this when selectedSlots changes since the popup needs to know
    // But we can make it more efficient
    return selectedSlots.size > 0 ? handleDeleteSelectedSpells : undefined;
  }, [selectedSlots.size, handleDeleteSelectedSpells]); // Minimal dependency

  // Create a wrapper for mouse down that only activates drag selection after hold delay
  const HOLD_DELAY = 300; // ms to wait before starting drag selection
  const handleMouseDownWrapper = useCallback(
    (index: number, event: React.MouseEvent) => {
      let holdTimeoutId: NodeJS.Timeout | null = null;
      let isMouseStillDown = true;

      // Set up mouse up listener to detect quick clicks
      const handleMouseUpForHold = () => {
        isMouseStillDown = false;
        if (holdTimeoutId) {
          clearTimeout(holdTimeoutId);
          holdTimeoutId = null;
        }
        document.removeEventListener("mouseup", handleMouseUpForHold);
      };

      document.addEventListener("mouseup", handleMouseUpForHold, {
        once: true
      });

      // Only activate drag selection after hold delay
      holdTimeoutId = setTimeout(() => {
        if (isMouseStillDown) {
          // User is actually holding - now activate drag selection
          handleMouseDown(index, event);
        }
        holdTimeoutId = null;
      }, HOLD_DELAY);
    },
    [handleMouseDown]
  );

  // Create stable callback refs to prevent unnecessary rerenders
  const stableCallbacks = useMemo(
    () => ({
      onEmptySlotClick: handleSlotClick,
      onFilledSlotClick: handleSlotClick, // Use unified handler for both empty and filled slots
      onMouseDown: handleMouseDownWrapper, // Use wrapper instead of direct handleMouseDown
      onMouseEnter: handleMouseEnter,
      onReplaceSpell: onReplaceSpell
    }),
    [
      handleSlotClick,
      handleMouseDownWrapper, // Updated dependency
      handleMouseEnter,
      onReplaceSpell
    ]
  );

  // Create conditional handlers that disable interactions when popup is open
  const conditionalCallbacks = useMemo(() => {
    const isPopupOpen = activeSlot !== null;

    if (isPopupOpen) {
      // Return no-op handlers when popup is open
      return {
        onEmptySlotClick: () => {},
        onFilledSlotClick: () => {},
        onMouseDown: () => {},
        onMouseEnter: () => {},
        onReplaceSpell: onReplaceSpell // Keep this enabled for tier popups
      };
    }

    // Return normal handlers when popup is closed
    return stableCallbacks;
  }, [activeSlot, stableCallbacks, onReplaceSpell]);

  // Pre-compute isSelected values to minimize during render
  const selectedStates = useMemo(() => {
    const states = new Array(64);
    for (let i = 0; i < 64; i++) {
      states[i] = selectedSlots.has(i);
    }
    return states;
  }, [selectedSlots]); // Only recalculate when selectedSlots actually changes

  const [isSpellBeingDraggedOver, setIsSpellBeingDraggedOver] = useState(false);

  // Handle spell drag and drop over the entire deck
  const handleDeckDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsSpellBeingDraggedOver(true);
  }, []);

  const handleDeckDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsSpellBeingDraggedOver(true);
  }, []);

  const handleDeckDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're actually leaving the deck grid container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsSpellBeingDraggedOver(false);
    }
  }, []);

  const handleDeckDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsSpellBeingDraggedOver(false);

      try {
        const spellData = e.dataTransfer.getData("application/json");
        if (spellData) {
          const spell = JSON.parse(spellData) as Spell;
          // Always add to the end of the deck (next available slot)
          onAddSpell(spell, (deck.spells as Spell[]).length, 1);
        }
      } catch (error) {
        console.error("Error parsing dropped spell data:", error);
      }
    },
    [deck.spells, onAddSpell]
  );

  return (
    <div className="w-full pb-4 mb-12">
      <TooltipProvider>
        <div className="max-w-xl max-h-[420px] mx-auto md:mt-6">
          <div
            className={`grid grid-cols-8 gap-1 bg-accent border border-border p-3 rounded-lg deck-grid relative ${
              activeSlot !== null ? "opacity-60 pointer-events-none" : ""
            }`}
            onDragOver={handleDeckDragOver}
            onDragEnter={handleDeckDragEnter}
            onDragLeave={handleDeckDragLeave}
            onDrop={handleDeckDrop}
          >
            {/* Spell drag overlay positioned relative to the deck grid */}
            {isSpellBeingDraggedOver && (
              <div className="absolute inset-0 bg-black/20 rounded-lg z-10 pointer-events-none" />
            )}

            {grid.map((spell, index) => (
              <div key={index}>
                <DeckGridSlot
                  spell={spell}
                  index={index}
                  isSelected={selectedStates[index]}
                  isDragging={isDragging}
                  isPopupOpen={activeSlot !== null}
                  onEmptySlotClick={conditionalCallbacks.onEmptySlotClick}
                  onFilledSlotClick={conditionalCallbacks.onFilledSlotClick}
                  onMouseDown={conditionalCallbacks.onMouseDown}
                  onMouseEnter={conditionalCallbacks.onMouseEnter}
                  onReplaceSpell={conditionalCallbacks.onReplaceSpell}
                />
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>

      {/* Spell Search Popup */}
      {activeSlot !== null && (
        <SpellSearchPopup
          position={popupPosition}
          onClose={handlePopupClose}
          onSelectSpell={handleSpellSelection}
          availableSlots={availableSlots}
          isReplacing={isReplacing}
          selectedSlots={selectedSlots}
          onDeleteSelected={deleteHandler}
          grid={grid}
        />
      )}
    </div>
  );
});

export default DeckGrid;
