"use client";

import type { Deck, Spell } from "@/lib/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DeckGridSlot } from "./deck-grid-slot";
import { useDeckGrid } from "./use-deck-grid";
import { useDragSelection } from "./use-drag-selection";
import SpellSearchPopup from "@/components/deck-grid/spell-search-popup";
import { useCallback, useEffect, useMemo, memo } from "react";
import { gridLogger } from "@/lib/logger";

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
  onBulkReplaceSpells,
  onBulkAddSpells,
  onMixedOperation
}: DeckGridProps) {
  // Memoize grid creation - only recreate when deck.spells changes
  const grid = useMemo(() => {
    const rows = 8;
    const cols = 8;
    const newGrid: (Spell | null)[] = Array(rows * cols).fill(null);

    // Fill the grid with spells from the deck
    deck.spells.forEach((spell, index) => {
      if (index < newGrid.length) {
        newGrid[index] = spell;
      }
    });

    return newGrid;
  }, [deck.spells]);

  // Memoize deck key for re-render optimization
  const deckKey = useMemo(
    () =>
      `grid-${deck.spells.length}-${deck.spells
        .map((s) => `${s.name}-${s.tier}`)
        .join("-")}`,
    [deck.spells]
  );

  // Debug: Log when deck changes
  useEffect(() => {
    gridLogger.debug("Deck changed, grid should re-render:", {
      deckLength: deck.spells.length,
      spells: deck.spells.map((s, i) => ({
        index: i,
        name: s.name,
        id: s.name,
        tier: s.tier
      }))
    });
  }, [deck.spells]);

  // Memoize multi-slot operation handler to prevent recreation on every render
  const handleMultiSlotOperation = useCallback(
    (spell: Spell, slots: number[], currentGrid: (Spell | null)[]) => {
      gridLogger.group("Grid vs deck alignment debugging");
      gridLogger.debug("Selected slots:", slots);
      gridLogger.debug(
        "Current deck:",
        deck.spells.map((s, i) => ({ deckIndex: i, name: s.name, id: s.name }))
      );
      gridLogger.debug(
        "Grid state for selected slots:",
        slots.map((gridIndex) => ({
          gridIndex,
          spell: currentGrid[gridIndex]?.name || "empty",
          spellId: currentGrid[gridIndex]?.name || null
        }))
      );

      // Separate slots into those that need replacement vs addition
      const slotsToReplace = slots.filter(
        (slotIndex) => currentGrid[slotIndex] !== null
      );
      const slotsToAdd = slots.filter(
        (slotIndex) => currentGrid[slotIndex] === null
      );

      gridLogger.debug("Slots to replace (grid indices):", slotsToReplace);
      gridLogger.debug("Slots to add (grid indices):", slotsToAdd);

      // For mixed operations, we need to handle this as a single atomic operation
      // to prevent state conflicts between replace and add operations
      if (slotsToReplace.length > 0 && slotsToAdd.length > 0) {
        gridLogger.info(
          "Mixed operation detected - handling as single atomic operation"
        );

        // Update deck with single atomic operation
        if (onMixedOperation) {
          gridLogger.debug("Using atomic mixed operation");
          onMixedOperation(spell, slotsToReplace, slotsToAdd.length);
        } else {
          gridLogger.warn("Fallback: No atomic mixed operation available");
          // Fallback to sequential operations (which causes the bug)
        }
      } else {
        // Handle pure replacement or pure addition operations
        if (slotsToReplace.length > 0) {
          gridLogger.info("Pure replacement operation");
          if (onBulkReplaceSpells && slotsToReplace.length > 1) {
            onBulkReplaceSpells(spell, slotsToReplace);
          } else if (onReplaceSpell) {
            slotsToReplace.forEach((slotIndex) => {
              gridLogger.debug(
                `Calling onReplaceSpell(${spell.name}, ${slotIndex})`
              );
              onReplaceSpell(
                currentGrid[slotIndex]?.name || "",
                spell,
                slotIndex
              );
            });
          }
        }

        if (slotsToAdd.length > 0) {
          gridLogger.info("Pure addition operation");
          if (onBulkAddSpells && slotsToAdd.length > 1) {
            onBulkAddSpells(spell, slotsToAdd);
          } else if (onAddSpell) {
            slotsToAdd.forEach((slotIndex) => {
              onAddSpell(spell, slotIndex, 1);
            });
          }
        }
      }

      gridLogger.groupEnd();
    },
    [
      deck.spells,
      onMixedOperation,
      onBulkReplaceSpells,
      onReplaceSpell,
      onBulkAddSpells,
      onAddSpell
    ]
  );

  const {
    activeSlot,
    popupPosition,
    isReplacing,
    handleEmptySlotClick,
    handleFilledSlotClick,
    handleSelectSpell,
    closePopup,
    setActiveSlot,
    setPopupPosition,
    setIsReplacing
  } = useDeckGrid({
    onAddSpell,
    onReplaceSpell,
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

  // Memoize drag completion handler
  const handleDragComplete = useCallback(() => {
    // Show popup if we have selected slots after drag
    if (selectedSlots.size > 0) {
      // Check if we have any filled slots in the selection
      const selectedSlotIndices = Array.from(selectedSlots);
      const hasFilledSlots = selectedSlotIndices.some(
        (index) => grid[index] !== null
      );
      const hasEmptySlots = selectedSlotIndices.some(
        (index) => grid[index] === null
      );

      // Position popup in center of screen or use a default position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      setPopupPosition({ top: centerY - 200, left: centerX - 160 });
      setActiveSlot(selectedSlotIndices[0]); // Use first selected slot as reference

      // Set mode based on selection content
      // If we have both filled and empty slots, we'll handle this as a mixed operation
      // If only filled slots, it's a replace operation
      // If only empty slots, it's an add operation
      setIsReplacing(hasFilledSlots && !hasEmptySlots);
    }
  }, [selectedSlots, grid, setPopupPosition, setActiveSlot, setIsReplacing]);

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

  // Memoize single slot click handler
  const handleSlotClick = useCallback(
    (index: number, event: React.MouseEvent) => {
      // If we have existing selections, clicking should either:
      // 1. If clicking on a selected slot, deselect all
      // 2. If clicking on an unselected slot, deselect all
      if (selectedSlots.size > 0) {
        clearSelection();
        return;
      }

      // Normal single slot operation when no selections exist
      if (grid[index]) {
        handleFilledSlotClick(index, event);
      } else {
        handleEmptySlotClick(index, event);
      }
    },
    [
      selectedSlots.size,
      grid,
      handleFilledSlotClick,
      handleEmptySlotClick,
      clearSelection
    ]
  );

  // Handle clicking outside to clear selection
  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      // Only clear if we have selections and it's not a drag operation
      if (selectedSlots.size > 0 && !isDragging) {
        const target = event.target as Element;
        // Check if click is outside the deck grid
        if (!target.closest(".deck-grid")) {
          clearSelection();
        }
      }
    },
    [selectedSlots.size, isDragging, clearSelection]
  );

  // Add outside click listener
  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [handleOutsideClick]);

  // Memoize spell selection handler
  const handleSpellSelection = useCallback(
    (spell: Spell, quantity: number) => {
      // Always use the current grid state, not the captured one
      const currentGrid: (Spell | null)[] = Array(64).fill(null);
      deck.spells.forEach((deckSpell, index) => {
        if (index < currentGrid.length) {
          currentGrid[index] = deckSpell;
        }
      });

      handleSelectSpell(
        spell,
        quantity,
        selectedSlots,
        currentGrid,
        clearSelection
      );
    },
    [deck.spells, handleSelectSpell, selectedSlots, clearSelection]
  );

  // Memoize delete selected spells handler
  const handleDeleteSelectedSpells = useCallback(() => {
    if (selectedSlots.size > 0) {
      // Get indices of slots that have spells
      const indicesToRemove = Array.from(selectedSlots).filter(
        (slotIndex) => grid[slotIndex] !== null
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
  }, [selectedSlots, grid, onBulkRemoveSpells, onRemoveSpell, clearSelection]);

  // Memoize popup close handler
  const handlePopupClose = useCallback(() => {
    closePopup();
    clearSelection();
  }, [closePopup, clearSelection]);

  // Memoize computed values for popup
  const availableSlots = useMemo(
    () => 64 - deck.spells.length,
    [deck.spells.length]
  );
  const deleteHandler = useMemo(
    () => (selectedSlots.size > 0 ? handleDeleteSelectedSpells : undefined),
    [selectedSlots.size, handleDeleteSelectedSpells]
  );

  // Memoized slot component to prevent unnecessary rerenders
  const MemoizedSlot = memo(
    function MemoizedSlot({
      spell,
      index,
      isSelected
    }: {
      spell: Spell | null;
      index: number;
      isSelected: boolean;
    }) {
      return (
        <DeckGridSlot
          spell={spell}
          index={index}
          isSelected={isSelected}
          isDragging={isDragging}
          onEmptySlotClick={handleSlotClick}
          onFilledSlotClick={handleSlotClick}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onReplaceSpell={onReplaceSpell}
        />
      );
    },
    (prevProps, nextProps) => {
      // Only rerender if spell or selection state actually changes
      return (
        prevProps.spell === nextProps.spell &&
        prevProps.index === nextProps.index &&
        prevProps.isSelected === nextProps.isSelected
      );
    }
  );

  return (
    <div className="w-full pb-4 mb-12">
      <TooltipProvider>
        <div className="max-w-xl max-h-[420px] mx-auto md:mt-6">
          <div
            key={deckKey}
            className="grid grid-cols-8 gap-1 bg-secondary border border-border p-3 rounded-lg deck-grid"
          >
            {grid.map((spell, index) => (
              <div key={`slot-${index}-${spell?.name || "empty"}`}>
                <MemoizedSlot
                  spell={spell}
                  index={index}
                  isSelected={selectedSlots.has(index)}
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
