"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Spell } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SpellSearchBar } from "@/components/shared/spell-search-bar";
import { useSpellFilter } from "@/components/shared/use-spell-filter";
import { SpellList } from "../spell-sidebar/spell-list";

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

export default function SpellSearchPopup({
  position,
  onClose,
  onSelectSpell,
  availableSlots,
  isReplacing = false,
  selectedSlots = new Set(),
  onDeleteSelected,
  grid = []
}: SpellSearchPopupProps) {
  const selectedSlotsCount = selectedSlots.size;
  const maxQuantity =
    selectedSlotsCount > 0 ? selectedSlotsCount : Math.min(4, availableSlots);
  const [spellQuantity, setSpellQuantity] = useState(
    selectedSlotsCount > 0 ? selectedSlotsCount : 1
  );
  const popupRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    categoryFilters,
    setCategoryFilters,
    filteredSpells
  } = useSpellFilter();

  // Calculate filled and empty slots for better messaging
  const filledSlotsCount =
    selectedSlotsCount > 0
      ? Array.from(selectedSlots).filter((index) => grid[index] !== null).length
      : 0;

  const emptySlotsCount = selectedSlotsCount - filledSlotsCount;
  const isMixedOperation = filledSlotsCount > 0 && emptySlotsCount > 0;

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

  // Adjust position to ensure popup stays within viewport
  const adjustedPosition = useMemo(() => ({ ...position }), [position]);

  // Check if we need to adjust the position based on viewport
  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust horizontal position if needed
      if (rect.right > viewportWidth) {
        const overflow = rect.right - viewportWidth;
        adjustedPosition.left = Math.max(0, position.left - overflow - 20);
      }

      // Adjust vertical position if needed
      if (rect.bottom > viewportHeight) {
        const overflow = rect.bottom - viewportHeight;
        adjustedPosition.top = Math.max(0, position.top - overflow - 20);
      }
    }
  }, [position, adjustedPosition]);

  return (
    <div
      ref={popupRef}
      className="fixed z-50 gradient border rounded-xl shadow-2xl p-4 w-80 max-h-[80vh] flex flex-col"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">
          {isReplacing ? "Replace Spell" : "Add Spell to Deck"}
        </h3>
        <div className="flex items-center gap-2">
          {selectedSlotsCount > 0 && onDeleteSelected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDeleteSelected();
                onClose();
              }}
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
            {availableSlots} {availableSlots === 1 ? "slot" : "slots"} available
            in deck
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
              onValueChange={(value) => setSpellQuantity(value[0])}
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
              replace, {emptySlotsCount} to fill. Each slot will contain exactly
              one spell.
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
          You are replacing spells in {selectedSlotsCount} slots. Each slot will
          be replaced with one copy of the selected spell.
        </div>
      )}

      {isReplacing && selectedSlotsCount === 0 && (
        <div className="text-xs text-amber-400 mb-3 border-t border-blue-900/30 pt-3">
          You are replacing an existing spell. Select a new spell to replace it.
        </div>
      )}

      <div className="overflow-y-auto flex-1">
        <SpellList
          filteredSpells={filteredSpells}
          onSpellClick={(spell) =>
            onSelectSpell(spell, isReplacing ? 1 : spellQuantity)
          }
        />
      </div>
    </div>
  );
}
