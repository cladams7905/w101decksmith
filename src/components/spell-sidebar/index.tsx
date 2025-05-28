import {
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
  type MutableRefObject
} from "react";
import type { Spell } from "@/lib/types";
import { SpellList } from "./spell-list";
import { SpellQuantityPopup } from "./spell-quantity-popup";
import { UpgradeMembershipModal } from "@/components/spell-sidebar/upgrade-membership-modal";
import { useSpellFilter } from "../shared/use-spell-filter";
import { SpellSearchBar } from "../shared/spell-search-bar";
import { LoadingProgress } from "@/components/ui/loading-progress";

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

  // Memoize available slots calculation
  const availableSlots = useMemo(
    () => 64 - currentDeck.spells.length,
    [currentDeck.spells.length]
  );

  // Memoize spell click handler
  const handleSpellClick = useCallback(
    (spell: Spell, event: React.MouseEvent) => {
      selectedCardRef.current = event.currentTarget as HTMLElement;
      setSelectedSpell(spell);
    },
    []
  );

  // Memoize spell popup close handler
  const handleCloseSpellPopup = useCallback(() => {
    setSelectedSpell(null);
  }, []);

  // Memoize loading component with progress bar
  const loadingComponent = useMemo(
    () => (
      <div className="bg-card w-full h-full">
        <LoadingProgress text="Loading spells..." className="h-32" />
      </div>
    ),
    []
  );

  // Memoize error component
  const errorComponent = useMemo(
    () => (
      <div className="bg-card p-4 w-full">
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    ),
    [error]
  );

  if (loading) {
    return loadingComponent;
  }

  if (error) {
    return errorComponent;
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
          onClose={handleCloseSpellPopup}
          onAddSpell={onAddSpell}
          availableSlots={availableSlots}
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
