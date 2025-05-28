"use client";

import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { X, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Spell } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  const maxQuantity = useMemo(
    () =>
      selectedSlotsCount > 0 ? selectedSlotsCount : Math.min(4, availableSlots),
    [selectedSlotsCount, availableSlots]
  );

  const [spellQuantity, setSpellQuantity] = useState(
    selectedSlotsCount > 0 ? selectedSlotsCount : 1
  );
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
      onSelectSpell(spell, isReplacing ? 1 : spellQuantity);
    },
    [onSelectSpell, isReplacing, spellQuantity]
  );

  // Memoize quantity change handler
  const handleQuantityChange = useCallback((value: number[]) => {
    setSpellQuantity(value[0]);
  }, []);

  // Update spell quantity when selected slots change
  useEffect(() => {
    setSpellQuantity(selectedSlotsCount > 0 ? selectedSlotsCount : 1);
  }, [selectedSlotsCount]);

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
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popupRef}
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
          <>
            <div className="text-xs text-muted-foreground mb-3">
              {availableSlots} {availableSlots === 1 ? "slot" : "slots"}{" "}
              available in deck
              {spellQuantity > 1 && (
                <span className="ml-1">
                  (adding {spellQuantity}{" "}
                  {spellQuantity === 1 ? "copy" : "copies"})
                </span>
              )}
            </div>

            <div className="space-y-3 mb-3 border-t border-blue-900/30 pt-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="popup-spell-quantity">Quantity</Label>
                <span className="text-sm font-medium">{spellQuantity}</span>
              </div>
              <Slider
                id="popup-spell-quantity"
                min={1}
                max={maxQuantity}
                step={1}
                value={[spellQuantity]}
                onValueChange={handleQuantityChange}
                className="w-full"
              />
            </div>
          </>
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
