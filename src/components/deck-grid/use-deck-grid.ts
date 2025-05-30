import { useState, useCallback } from "react";
import type { Spell } from "@/lib/types";

interface UseDeckGridProps {
  onAddSpell: (spell: Spell, index: number, quantity: number) => void;
  onReplaceSpell: (spellName: string, newSpell: Spell, index: number) => void;
  onRemoveSpell?: (index: number) => void;
  onMultiSlotOperation?: (
    spell: Spell,
    slots: number[],
    grid: (Spell | null)[]
  ) => void;
}

interface UseDeckGridReturn {
  activeSlot: number | null;
  popupPosition: { top: number; left: number };
  isReplacing: boolean;
  handleEmptySlotClick: (index: number, event: React.MouseEvent) => void;
  handleFilledSlotClick: (index: number, event: React.MouseEvent) => void;
  handleSelectSpell: (
    spell: Spell,
    quantity: number,
    selectedSlots?: Set<number>,
    grid?: (Spell | null)[],
    clearSelection?: () => void
  ) => void;
  closePopup: () => void;
  setActiveSlot: (slot: number | null) => void;
  setPopupPosition: (position: { top: number; left: number }) => void;
  setIsReplacing: (replacing: boolean) => void;
}

export function useDeckGrid({
  onAddSpell,
  onReplaceSpell,
  onRemoveSpell,
  onMultiSlotOperation
}: UseDeckGridProps): UseDeckGridReturn {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [isReplacing, setIsReplacing] = useState(false);

  const handleEmptySlotClick = useCallback(
    (index: number, event: React.MouseEvent) => {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setPopupPosition({
        top: rect.top,
        left: rect.right + 10
      });
      setActiveSlot(index);
      setIsReplacing(false);
    },
    []
  );

  const handleFilledSlotClick = useCallback(
    (index: number) => {
      // Directly remove the spell at this index
      if (onRemoveSpell) {
        onRemoveSpell(index);
      }
    },
    [onRemoveSpell]
  );

  const handleSelectSpell = useCallback(
    (
      spell: Spell,
      quantity: number,
      selectedSlots?: Set<number>,
      grid?: (Spell | null)[],
      clearSelection?: () => void
    ) => {
      if (
        selectedSlots &&
        selectedSlots.size > 0 &&
        grid &&
        onMultiSlotOperation
      ) {
        // Handle multi-slot operation
        const slotsArray = Array.from(selectedSlots);
        onMultiSlotOperation(spell, slotsArray, grid);
        // Clear selection after multi-slot operation
        if (clearSelection) {
          clearSelection();
        }
      } else if (activeSlot !== null) {
        // Handle single slot operation
        if (isReplacing) {
          onReplaceSpell(spell.name, spell, activeSlot);
        } else {
          onAddSpell(spell, activeSlot, quantity);
        }
      }
      setActiveSlot(null);
    },
    [activeSlot, isReplacing, onAddSpell, onReplaceSpell, onMultiSlotOperation]
  );

  const closePopup = useCallback(() => setActiveSlot(null), []);

  return {
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
  };
}
