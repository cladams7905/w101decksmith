import {
  useRef,
  useState,
  useCallback,
  useEffect,
  memo,
  type MutableRefObject
} from "react";
import type { Spell } from "@/lib/types";
import { SpellList } from "./spell-list";
import { SpellQuantityPopup } from "./spell-quantity-popup";
import { UpgradeMembershipModal } from "@/components/spell-sidebar/upgrade-membership-modal";
import { useSpellFilter } from "../shared/use-spell-filter";
import { SpellSearchBar } from "../shared/spell-search-bar";
import { Progress } from "@/components/ui/progress";

interface SpellSidebarProps {
  currentDeck: {
    spells: Spell[];
  };
  onAddSpell: (spell: Spell, quantity: number) => void;
}

export const SpellSidebar = memo(function SpellSidebar({
  currentDeck,
  onAddSpell
}: SpellSidebarProps) {
  const {
    searchQuery,
    setSearchQuery,
    categoryFilters,
    setCategoryFilters,
    filteredSpells,
    loading,
    error
  } = useSpellFilter();

  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const selectedCardRef = useRef<HTMLElement | null>(
    null
  ) as MutableRefObject<HTMLElement | null>;
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Animate loading progress
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => (prev >= 90 ? 0 : prev + 10));
      }, 400);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [loading]);

  const handleSpellClick = useCallback(
    (spell: Spell, event: React.MouseEvent) => {
      selectedCardRef.current = event.currentTarget as HTMLElement;
      setSelectedSpell(spell);
    },
    []
  );

  const handleCloseQuantityPopup = useCallback(() => {
    setSelectedSpell(null);
  }, []);

  if (loading) {
    return (
      <div className="bg-card p-4 w-full">
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <Progress value={loadingProgress} className="w-[60%]" />
          <div className="text-xs text-muted-foreground">Loading spells...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card p-4 w-full">
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card flex flex-col h-full w-full">
      <SpellSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilters={categoryFilters}
        onCategoryFiltersChange={setCategoryFilters}
        className="mb-2 pl-2 pr-3 py-4"
      />

      {/* List of spells in accordions */}
      <div className="flex-1 overflow-auto">
        <SpellList
          filteredSpells={filteredSpells}
          onSpellClick={handleSpellClick}
        />
      </div>

      {/* Spell Quantity Selection */}
      {selectedSpell && (
        <SpellQuantityPopup
          spell={selectedSpell}
          triggerRef={selectedCardRef}
          onClose={handleCloseQuantityPopup}
          onAddSpell={onAddSpell}
          availableSlots={64 - currentDeck.spells.length}
        />
      )}

      {/* Sticky sidebar footer */}
      <div className="border-t p-4 mt-auto bg-background gradient-special backdrop-blur-2xl z-20">
        <UpgradeMembershipModal />
        <div className="text-xs text-muted-foreground text-center mt-2">
          Wizard101 Deck Builder
        </div>
      </div>
    </div>
  );
});
