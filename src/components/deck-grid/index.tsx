"use client";

import type { Deck, Spell } from "@/lib/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DeckGridSlot } from "./deck-grid-slot";
import { useDeckGrid } from "./use-deck-grid";
import { useDragSelection } from "./use-drag-selection";
import SpellSearchPopup from "@/components/deck-grid/spell-search-popup";
import { useCallback, useEffect } from "react";
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

export default function DeckGrid({
  deck,
  onAddSpell,
  onReplaceSpell,
  onRemoveSpell,
  onBulkRemoveSpells,
  onBulkReplaceSpells,
  onBulkAddSpells,
  onMixedOperation
}: DeckGridProps) {
  // Create an 8x8 grid (64 slots)
  const rows = 8;
  const cols = 8;
  const grid: (Spell | null)[] = Array(rows * cols).fill(null);

  // Fill the grid with spells from the deck
  deck.spells.forEach((spell, index) => {
    if (index < grid.length) {
      grid[index] = spell;
    }
  });

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

  // Handle multi-slot operations (mixed add/replace)
  const handleMultiSlotOperation = (
    spell: Spell,
    slots: number[],
    currentGrid: (Spell | null)[]
  ) => {
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
  };

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
    shouldDisableTooltips,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    clearSelection
  } = useDragSelection();

  // Handle drag completion - show popup when drag ends with selected slots
  const handleDragComplete = useCallback(() => {
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
  }, [selectedSlots, setPopupPosition, setActiveSlot, setIsReplacing, grid]);

  // Add global mouse up listener for drag selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
      handleDragComplete();
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [handleMouseUp, selectedSlots.size, handleDragComplete]);

  // Handle single slot clicks (when no multi-selection is active)
  const handleSlotClick = (index: number, event: React.MouseEvent) => {
    if (selectedSlots.size === 0) {
      // Normal single slot operation
      if (grid[index]) {
        handleFilledSlotClick(index, event);
      } else {
        handleEmptySlotClick(index, event);
      }
    }
  };

  // Create a wrapper for handleSelectSpell that passes the selected slots and grid
  const handleSpellSelection = (spell: Spell, quantity: number) => {
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
  };

  // Handle deleting spells from selected slots
  const handleDeleteSelectedSpells = () => {
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
  };

  return (
    <div className="w-full pb-4 mb-12">
      <TooltipProvider>
        <div className="max-w-xl max-h-[420px] mx-auto md:mt-6">
          <div
            key={`grid-${deck.spells.length}-${deck.spells
              .map((s) => `${s.name}-${s.tier}`)
              .join("-")}`}
            className="grid grid-cols-8 gap-1 bg-secondary border border-border p-3 rounded-lg deck-grid"
          >
            {grid.map((spell, index) => (
              <div key={`slot-${index}-${spell?.name || "empty"}`}>
                <DeckGridSlot
                  spell={spell}
                  index={index}
                  isSelected={selectedSlots.has(index)}
                  isDragging={shouldDisableTooltips}
                  onEmptySlotClick={handleSlotClick}
                  onFilledSlotClick={handleSlotClick}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onReplaceSpell={onReplaceSpell}
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
          onClose={() => {
            closePopup();
            clearSelection();
          }}
          onSelectSpell={handleSpellSelection}
          availableSlots={64 - deck.spells.length}
          isReplacing={isReplacing}
          selectedSlots={selectedSlots}
          onDeleteSelected={
            selectedSlots.size > 0 ? handleDeleteSelectedSpells : undefined
          }
          grid={grid}
        />
      )}
    </div>
  );
}
