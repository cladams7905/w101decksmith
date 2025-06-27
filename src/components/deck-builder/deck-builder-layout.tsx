"use client";

import { ResizablePanel } from "@/components/shared/resizable-panel";
import { DeckHeader } from "@/components/deck-header";
import { RightSidebar } from "@/components/right-sidebar/";
import { SpellSidebar } from "@/components/spell-sidebar";
import DeckGrid from "@/components/deck-grid";
import { useDeck } from "@/lib/contexts/deck-context";
import { useUI } from "@/lib/contexts/ui-context";
import type { Spell } from "@/db/database.types";
import { deckLogger } from "@/lib/logger";

export function DeckBuilderLayout() {
  const {
    currentDeck,
    addSpell,
    addSpellToSlot,
    removeSpell,
    replaceSpell,
    updateDeck
  } = useDeck();

  const {
    rightSidebarOpen,
    leftPanelWidth,
    rightPanelWidth,
    isMobile,
    setLeftPanelWidth,
    setRightPanelWidth
  } = useUI();

  const handleRemoveSpell = (index: number) => {
    removeSpell(index);
  };

  const handleBulkRemoveSpells = (indices: number[]) => {
    // Sort indices in descending order to avoid index shifting issues
    const sortedIndices = [...indices].sort((a, b) => b - a);
    const newSpells = [...(currentDeck.spells as Spell[])];

    // Remove spells starting from the highest index
    sortedIndices.forEach((index) => {
      if (index < newSpells.length) {
        newSpells.splice(index, 1);
      }
    });

    updateDeck({ spells: newSpells });
  };

  const handleBulkReplaceSpells = (spell: Spell, indices: number[]) => {
    const newSpells = [...(currentDeck.spells as Spell[])];

    // Replace spells at the specified indices
    indices.forEach((index) => {
      if (index < newSpells.length) {
        newSpells[index] = spell;
      }
    });

    updateDeck({ spells: newSpells });
  };

  const handleAddSpellToGridPositions = (spell: Spell, positions: number[]) => {
    const newSpells = [...(currentDeck.spells as Spell[])];

    // For each position, add the spell to the end of the deck
    // This maintains the current behavior where spells are added sequentially
    positions.forEach(() => {
      if (newSpells.length < 64) {
        newSpells.push(spell);
      }
    });

    updateDeck({ spells: newSpells });
  };

  const handleMixedOperation = (
    spell: Spell,
    replaceIndices: number[],
    addCount: number
  ) => {
    deckLogger.info("=== Atomic mixed operation ===");
    deckLogger.info("Spell:", spell.name);
    deckLogger.info("Replace indices:", replaceIndices);
    deckLogger.info("Add count:", addCount);

    const newSpells = [...(currentDeck.spells as Spell[])];

    // First, handle replacements
    replaceIndices.forEach((index) => {
      if (index < newSpells.length) {
        deckLogger.debug(
          `Replacing deck[${index}]: "${newSpells[index].name}" -> "${spell.name}"`
        );
        newSpells[index] = spell;
      }
    });

    // Then, handle additions
    for (let i = 0; i < addCount; i++) {
      if (newSpells.length < 64) {
        deckLogger.debug(
          `Adding "${spell.name}" to deck (${i + 1}/${addCount})`
        );
        newSpells.push(spell);
      }
    }

    deckLogger.debug(
      "Final atomic result:",
      newSpells.map((s, i) => ({
        index: i,
        name: s.name,
        id: `${s.name}-${s.tier}`
      }))
    );

    updateDeck({ spells: newSpells });
    deckLogger.info("=== End atomic mixed operation ===");
  };

  return (
    <div className="flex flex-1 w-full overflow-hidden">
      <div className="hidden md:block">
        <ResizablePanel
          side="left"
          defaultWidth={leftPanelWidth}
          minWidth={240}
          maxWidth={500}
          onWidthChange={setLeftPanelWidth}
          className="h-full border-r"
        >
          <div className="h-full flex flex-col w-full">
            <SpellSidebar onAddSpell={addSpell} currentDeck={currentDeck} />
          </div>
        </ResizablePanel>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <DeckHeader />
        <div className="flex-1 overflow-y-auto p-4 md:px-6 md:pb-6 pt-0">
          <DeckGrid
            deck={currentDeck}
            onAddSpell={addSpellToSlot}
            onReplaceSpell={replaceSpell}
            onRemoveSpell={handleRemoveSpell}
            onBulkRemoveSpells={handleBulkRemoveSpells}
            onBulkReplaceSpells={handleBulkReplaceSpells}
            onBulkAddSpells={handleAddSpellToGridPositions}
            onMixedOperation={handleMixedOperation}
          />
        </div>
      </main>

      <RightSidebar
        isOpen={rightSidebarOpen}
        isMobile={isMobile}
        panelWidth={rightPanelWidth}
        onWidthChange={setRightPanelWidth}
        deck={currentDeck}
      />
    </div>
  );
}
