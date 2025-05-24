"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Deck, Spell } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/spell-tooltip";
import SpellSearchPopup from "@/components/spell-search-popup";
import { Plus, Edit } from "lucide-react";

// Import the SpellUtilityBadge component
import SpellUtilityBadge from "@/components/spell-utility-badge";

// Update the DeckGridProps interface to include the sorting state
interface DeckGridProps {
  deck: Deck;
  onAddSpell: (spell: Spell, index: number, quantity: number) => void;
  onReplaceSpell: (spell: Spell, index: number) => void;
  onSortDeck: (spells: Spell[]) => void;
}

// Add state variables for sorting at the beginning of the component function
export default function DeckGrid({
  deck,
  onAddSpell,
  onReplaceSpell,
  onSortDeck
}: DeckGridProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [isReplacing, setIsReplacing] = useState(false);

  const handleSort = (spells: Spell[]) => {
    onSortDeck(spells);
  };

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

  const handleEmptySlotClick = (index: number, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    setPopupPosition({
      top: rect.top,
      left: rect.right + 10 // Position to the right with a small gap
    });

    setActiveSlot(index);
    setIsReplacing(false);
  };

  const handleFilledSlotClick = (index: number, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    setPopupPosition({
      top: rect.top,
      left: rect.right + 10 // Position to the right with a small gap
    });

    setActiveSlot(index);
    setIsReplacing(true);
  };

  const handleSelectSpell = (spell: Spell, quantity: number) => {
    if (activeSlot !== null) {
      if (isReplacing) {
        onReplaceSpell(spell, activeSlot);
      } else {
        onAddSpell(spell, activeSlot, quantity);
      }
      setActiveSlot(null);
    }
  };

  // Add the sorting UI right before the grid
  return (
    <div className="w-full pb-4 mb-12">
      <TooltipProvider>
        <div className="grid grid-cols-8 gap-1 bg-secondary border border-border p-3 rounded-lg deck-grid">
          {grid.map((spell, index) => (
            <div key={index}>
              {spell ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`aspect-square flex items-center justify-center transition-all duration-200 
      bg-purple-900/50 border-purple-700/50 hover:border-purple-500 group cursor-pointer`}
                      onClick={(e) => handleFilledSlotClick(index, e)}
                    >
                      <CardContent className="p-1 h-full w-full flex flex-col items-center justify-center text-center relative">
                        <div className="text-[10px] font-medium truncate w-full">
                          {spell.name}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <div className="text-[8px] text-muted-foreground">
                            {spell.pips}
                          </div>
                          <div className="scale-75 origin-left">
                            <SpellUtilityBadge spell={spell} size="sm" />
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit className="h-4 w-4 text-white" />
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="p-0 border-0 rounded-xl"
                  >
                    <SpellTooltip spell={spell} schoolColor={spell.school} />
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Card
                  className={`aspect-square flex items-center justify-center transition-all duration-200 
                  border-blue-900/30 bg-linear-to-br from-blue-900/40 cursor-pointer
                  hover:bg-gray-600/30 hover:border-gray-400/50 group`}
                  onClick={(e) => handleEmptySlotClick(index, e)}
                >
                  <CardContent className="p-1 h-full w-full flex flex-col items-center justify-center text-center">
                    <Plus className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-[8px] text-muted-foreground">•</div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      </TooltipProvider>

      {/* Spell Search Popup */}
      {activeSlot !== null && (
        <SpellSearchPopup
          position={popupPosition}
          onClose={() => setActiveSlot(null)}
          onSelectSpell={handleSelectSpell}
          availableSlots={64 - deck.spells.length}
          isReplacing={isReplacing}
        />
      )}
    </div>
  );
}
