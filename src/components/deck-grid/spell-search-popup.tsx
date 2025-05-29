"use client";

import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { X, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Spell } from "@/lib/types";
import { SpellSearchBar } from "@/components/shared/spell-search-bar";
import { useSpellFilter } from "@/components/shared/use-spell-filter";
import { SpellList } from "../spell-sidebar/spell-list";
import { LoadingProgress } from "@/components/ui/loading-progress";

interface SpellSearchPopupProps {
  position: { top: number; left: number };
  onClose: () => void;
  onSelectSpell: (spell: Spell, quantity: number) => void;
  availableSlots: number;
  isReplacing?: boolean;
  selectedSlots?: Set<number>;
  onDeleteSelected?: () => void;
  grid?: (Spell | null)[];
}

const SpellSearchPopup = memo(function SpellSearchPopup({
  position,
  onClose,
  onSelectSpell,
  availableSlots,
  isReplacing = false,
  selectedSlots = new Set(),
  onDeleteSelected,
  grid = []
}: SpellSearchPopupProps) {
  // Memoize computed values to prevent unnecessary recalculations
  const selectedSlotsCount = useMemo(() => selectedSlots.size, [selectedSlots]);

  const popupRef = useRef<HTMLDivElement>(null);

  // Drag functionality state
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    categoryFilters,
    setCategoryFilters,
    filteredSpells,
    loading,
    error
  } = useSpellFilter();

  // Update position when prop changes, but only if it hasn't been dragged yet
  useEffect(() => {
    if (!hasBeenDragged) {
      setCurrentPosition(position);
    }
  }, [position, hasBeenDragged]);

  // Memoize slot calculations
  const { filledSlotsCount, emptySlotsCount, isMixedOperation } =
    useMemo(() => {
      const filled =
        selectedSlotsCount > 0
          ? Array.from(selectedSlots).filter((index) => grid[index] !== null)
              .length
          : 0;
      const empty = selectedSlotsCount - filled;
      const mixed = filled > 0 && empty > 0;

      return {
        filledSlotsCount: filled,
        emptySlotsCount: empty,
        isMixedOperation: mixed
      };
    }, [selectedSlotsCount, selectedSlots, grid]);

  // Memoize drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      setHasBeenDragged(true);
    }
  }, []);

  // Memoize delete handler
  const handleDeleteClick = useCallback(() => {
    if (onDeleteSelected) {
      onDeleteSelected();
      onClose();
    }
  }, [onDeleteSelected, onClose]);

  // Memoize spell selection handler
  const handleSpellSelect = useCallback(
    (spell: Spell) => {
      const quantity = selectedSlotsCount > 0 ? selectedSlotsCount : 1;
      onSelectSpell(spell, quantity);
    },
    [onSelectSpell, selectedSlotsCount]
  );

  // Drag functionality effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          left: e.clientX - dragOffset.x,
          top: e.clientY - dragOffset.y
        };

        // Keep popup within viewport bounds
        const popup = popupRef.current;
        if (popup) {
          const rect = popup.getBoundingClientRect();
          const maxLeft = window.innerWidth - rect.width;
          const maxTop = window.innerHeight - rect.height;

          newPosition.left = Math.max(0, Math.min(maxLeft, newPosition.left));
          newPosition.top = Math.max(0, Math.min(maxTop, newPosition.top));
        }

        setCurrentPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, dragOffset]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is on popup
      if (popupRef.current && popupRef.current.contains(target)) {
        return;
      }

      // Check if click is on any tooltip-related element (rendered in portals)
      const tooltipContent = target.closest('[data-slot="tooltip-content"]');
      if (tooltipContent) {
        return;
      }

      const tooltipTrigger = target.closest('[data-slot="tooltip-trigger"]');
      if (tooltipTrigger) {
        return;
      }

      const tooltipRoot = target.closest('[data-slot="tooltip"]');
      if (tooltipRoot) {
        return;
      }

      const tooltipProvider = target.closest('[data-slot="tooltip-provider"]');
      if (tooltipProvider) {
        return;
      }

      // Check if click is on any dialog-related element (SpellTierPopup uses Dialog)
      const dialogContent = target.closest('[data-slot="dialog-content"]');
      if (dialogContent) {
        return;
      }

      const dialogOverlay = target.closest('[data-slot="dialog-overlay"]');
      if (dialogOverlay) {
        return;
      }

      const dialogPortal = target.closest('[data-slot="dialog-portal"]');
      if (dialogPortal) {
        return;
      }

      const dialogHeader = target.closest('[data-slot="dialog-header"]');
      if (dialogHeader) {
        return;
      }

      const dialogFooter = target.closest('[data-slot="dialog-footer"]');
      if (dialogFooter) {
        return;
      }

      const dialogTitle = target.closest('[data-slot="dialog-title"]');
      if (dialogTitle) {
        return;
      }

      const dialogTrigger = target.closest('[data-slot="dialog-trigger"]');
      if (dialogTrigger) {
        return;
      }

      const dialogClose = target.closest('[data-slot="dialog-close"]');
      if (dialogClose) {
        return;
      }

      const dialogRoot = target.closest('[data-slot="dialog"]');
      if (dialogRoot) {
        return;
      }

      // Additional check for any element that might be part of a tooltip
      const radixTooltipElement = target.closest(
        "[data-radix-tooltip-content]"
      );
      if (radixTooltipElement) {
        return;
      }

      // Additional check for any element that might be part of a dialog
      const radixDialogElement = target.closest("[data-radix-dialog-content]");
      if (radixDialogElement) {
        return;
      }

      // If click is outside popup and not on tooltip or dialog, close the popup
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      data-spell-search-popup
      className="fixed z-50 bg-background border rounded-lg shadow-2xl w-80 max-h-[80vh] flex flex-col"
      style={{
        top: `${currentPosition.top}px`,
        left: `${currentPosition.left}px`
      }}
    >
      {/* Draggable Header */}
      <div
        className="flex justify-between items-center p-4 pb-3 cursor-grab active:cursor-grabbing border-b border-border"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">
            {isReplacing ? "Replace Spell" : "Add Spell to Deck"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedSlotsCount > 0 && onDeleteSelected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              className="h-6 text-xs"
            >
              Delete
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3 flex flex-col flex-1 overflow-hidden">
        <SpellSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilters={categoryFilters}
          onCategoryFiltersChange={setCategoryFilters}
          className="mb-3"
        />

        {!isReplacing && selectedSlotsCount === 0 && (
          <div className="text-xs text-muted-foreground mb-3">
            {availableSlots} {availableSlots === 1 ? "slot" : "slots"} available
            in deck. Click a spell to add one copy.
          </div>
        )}

        {!isReplacing && selectedSlotsCount > 0 && (
          <div className="text-xs text-muted-foreground mb-3 border-t border-blue-900/30 pt-3">
            {isMixedOperation ? (
              <>
                {selectedSlotsCount} slots selected: {filledSlotsCount} to
                replace, {emptySlotsCount} to fill. Each slot will contain
                exactly one spell.
              </>
            ) : filledSlotsCount > 0 ? (
              <>
                {selectedSlotsCount} filled slots selected for replacement. Each
                slot will be replaced with one copy of the selected spell.
              </>
            ) : (
              <>
                {selectedSlotsCount} empty slots selected. Each slot will be
                filled with one copy of the selected spell.
              </>
            )}
          </div>
        )}

        {isReplacing && selectedSlotsCount > 0 && (
          <div className="text-xs text-amber-400 mb-3 border-t border-blue-900/30 pt-3">
            You are replacing spells in {selectedSlotsCount} slots. Each slot
            will be replaced with one copy of the selected spell.
          </div>
        )}

        {isReplacing && selectedSlotsCount === 0 && (
          <div className="text-xs text-amber-400 mb-3 border-t border-blue-900/30 pt-3">
            You are replacing an existing spell. Select a new spell to replace
            it.
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <LoadingProgress text="Loading spells..." className="py-4" />
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : (
            <SpellList
              filteredSpells={filteredSpells}
              onSpellClick={handleSpellSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default SpellSearchPopup;
