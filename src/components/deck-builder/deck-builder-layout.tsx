import { ResizablePanel } from "@/components/resizable-panel";
import { AppHeader } from "@/components/app-header";
import { DeckHeader } from "@/components/deck-header";
import { RightSidebar } from "@/components/right-sidebar";
import { BulkActionDialog } from "@/components/bulk-action-dialog";
import { SpellSidebar } from "@/components/spell-sidebar";
import DeckGrid from "@/components/deck-grid";
import { useDeck } from "@/lib/contexts/deck-context";
import { useUI } from "@/lib/contexts/ui-context";
import { useState } from "react";
import type { Spell } from "@/lib/types";
import { deckLogger } from "@/lib/logger";

export function DeckBuilderLayout() {
  const {
    currentDeck,
    decks,
    wizardLevel,
    wizardSchool,
    weavingClass,
    addSpell,
    addSpellToSlot,
    replaceSpell,
    createNewDeck,
    switchDeck,
    updateDeckSpells
  } = useDeck();

  const {
    rightSidebarOpen,
    leftPanelWidth,
    rightPanelWidth,
    isMobile,
    showNewDeckModal,
    showBulkActionDialog,
    toggleRightSidebar,
    setLeftPanelWidth,
    setRightPanelWidth,
    setShowNewDeckModal,
    setShowBulkActionDialog
  } = useUI();

  const [selectedSpellType, setSelectedSpellType] = useState<string | null>(
    null
  );
  const [bulkActionType] = useState<"edit" | "delete">("edit");
  const [isSpellId] = useState<boolean>(false);

  const handleDeleteSpellsByType = (typeId: string, isSpellId = false) => {
    const newSpells = isSpellId
      ? currentDeck.spells.filter((spell) => spell.id !== typeId)
      : currentDeck.spells.filter((spell) => spell.school !== typeId);
    updateDeckSpells(newSpells);
  };

  const handleRemoveSpell = (index: number) => {
    const newSpells = [...currentDeck.spells];
    newSpells.splice(index, 1);
    updateDeckSpells(newSpells);
  };

  const handleBulkRemoveSpells = (indices: number[]) => {
    // Sort indices in descending order to avoid index shifting issues
    const sortedIndices = [...indices].sort((a, b) => b - a);
    const newSpells = [...currentDeck.spells];

    // Remove spells starting from the highest index
    sortedIndices.forEach((index) => {
      if (index < newSpells.length) {
        newSpells.splice(index, 1);
      }
    });

    updateDeckSpells(newSpells);
  };

  const handleBulkReplaceSpells = (spell: Spell, indices: number[]) => {
    const newSpells = [...currentDeck.spells];

    // Replace spells at the specified indices
    indices.forEach((index) => {
      if (index < newSpells.length) {
        newSpells[index] = spell;
      }
    });

    updateDeckSpells(newSpells);
  };

  const handleAddSpellToGridPositions = (spell: Spell, positions: number[]) => {
    const newSpells = [...currentDeck.spells];

    // For each position, add the spell to the end of the deck
    // This maintains the current behavior where spells are added sequentially
    positions.forEach(() => {
      if (newSpells.length < 64) {
        newSpells.push(spell);
      }
    });

    updateDeckSpells(newSpells);
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

    const newSpells = [...currentDeck.spells];

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
      newSpells.map((s, i) => ({ index: i, name: s.name, id: s.id }))
    );

    updateDeckSpells(newSpells);
    deckLogger.info("=== End atomic mixed operation ===");
  };

  const handleBulkReplaceSpell = (newSpell: Spell) => {
    if (!selectedSpellType) return;

    const newSpells = currentDeck.spells.map((spell) =>
      isSpellId
        ? spell.id === selectedSpellType
          ? newSpell
          : spell
        : spell.school === selectedSpellType
        ? newSpell
        : spell
    );

    updateDeckSpells(newSpells);
    setShowBulkActionDialog(false);
    setSelectedSpellType(null);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground">
      <AppHeader
        currentDeck={currentDeck}
        decks={decks}
        onSwitchDeck={switchDeck}
        onCreateDeck={createNewDeck}
        onToggleRightSidebar={toggleRightSidebar}
        showNewDeckModal={showNewDeckModal}
        setShowNewDeckModal={setShowNewDeckModal}
        wizardSchool={wizardSchool}
        wizardLevel={wizardLevel}
        weavingClass={weavingClass}
        onAddSpell={addSpell}
      />

      <div className="flex flex-1 w-full overflow-hidden">
        <div className="hidden md:block">
          <ResizablePanel
            side="left"
            defaultWidth={leftPanelWidth}
            minWidth={240}
            maxWidth={500}
            onWidthChange={setLeftPanelWidth}
            className="h-[calc(100vh-4rem)] border-r"
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

      <BulkActionDialog
        open={showBulkActionDialog}
        onOpenChange={setShowBulkActionDialog}
        selectedSpellType={selectedSpellType}
        isSpellId={isSpellId}
        actionType={bulkActionType}
        currentDeck={currentDeck}
        onBulkReplaceSpell={handleBulkReplaceSpell}
        onDeleteSpellsByType={handleDeleteSpellsByType}
      />
    </div>
  );
}
