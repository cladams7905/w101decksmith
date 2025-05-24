import type { Spell } from "@/lib/types";
import { useState, useRef, type MutableRefObject } from "react";
import { UpgradeMembershipModal } from "@/components/upgrade-membership-modal";
import { SpellSearch } from "./spell-search";
import { SpellList } from "./spell-list";
import { SpellQuantityPopup } from "./spell-quantity-popup";

interface SpellSidebarProps {
  currentDeck: {
    spells: Spell[];
  };
  onAddSpell: (spell: Spell, quantity: number) => void;
}

export function SpellSidebar({ currentDeck, onAddSpell }: SpellSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [filteredSpells, setFilteredSpells] = useState<
    {
      id: string;
      name: string;
      color: string;
      spells: Spell[];
    }[]
  >([]);
  const selectedCardRef = useRef<HTMLElement | null>(
    null
  ) as MutableRefObject<HTMLElement | null>;

  const handleSpellClick = (spell: Spell, event: React.MouseEvent) => {
    selectedCardRef.current = event.currentTarget as HTMLElement;
    setSelectedSpell(spell);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Spell Searching and Filtering */}
      <SpellSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterChange={setFilteredSpells}
      />

      {/* List of spells in accordions */}
      <SpellList
        filteredSpells={filteredSpells}
        onSpellClick={handleSpellClick}
      />

      {/* Spell Quantity Selection */}
      {selectedSpell && (
        <SpellQuantityPopup
          spell={selectedSpell}
          triggerRef={selectedCardRef}
          onClose={() => setSelectedSpell(null)}
          onAddSpell={onAddSpell}
          availableSlots={64 - currentDeck.spells.length}
        />
      )}

      {/* Sticky sidebar footer with upgrade button */}
      <div className="border-t p-4 mt-auto bg-background gradient-special backdrop-blur-2xl z-20">
        <UpgradeMembershipModal />
        <div className="text-xs text-muted-foreground text-center mt-2">
          Wizard101 Deck Builder
        </div>
      </div>
    </div>
  );
}
