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

      // Popup dimensions (w-80 = 320px)
      const popupWidth = 320;
      const popupHeight = 585;

      // Calculate initial position
      let top = rect.top;
      let left = rect.right + 10;

      // Check if popup would go off the right edge of the screen
      if (left + popupWidth > window.innerWidth) {
        // Position to the left of the slot instead
        left = rect.left - popupWidth - 10;

        // If still off-screen to the left, center it horizontally
        if (left < 0) {
          left = Math.max(10, (window.innerWidth - popupWidth) / 2);
        }
      }

      // Check if popup would go below the bottom of the screen
      if (top + popupHeight > window.innerHeight) {
        // Position it so the bottom aligns with the viewport bottom (with some margin)
        top = window.innerHeight - popupHeight;

        // Ensure it doesn't go above the top of the screen
        if (top < 10) {
          top = 10;
        }
      }

      setPopupPosition({
        top,
        left
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
