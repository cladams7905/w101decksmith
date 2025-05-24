import { ResizablePanel } from "@/components/resizable-panel";
import { AppHeader } from "@/components/app-header";
import { DeckHeader } from "@/components/deck-header";
import { RightSidebar } from "@/components/right-sidebar";
import { BulkActionDialog } from "@/components/bulk-action-dialog";
import { SpellSidebar } from "@/components/spell-sidebar/spell-sidebar";
import DeckGrid from "@/components/deck-grid";
import { useDeck } from "@/lib/contexts/deck-context";
import { useUI } from "@/lib/contexts/ui-context";
import { useState } from "react";
import type { Spell } from "@/lib/types";

export function DeckBuilderLayout() {
  const {
    currentDeck,
    decks,
    wizardLevel,
    wizardSchool,
    weavingClass,
    sortBy,
    sortOrder,
    addSpell,
    addSpellToSlot,
    replaceSpell,
    createNewDeck,
    switchDeck,
    updateDeckName,
    deleteDeck,
    sortDeck,
    setWizardLevel,
    setWizardSchool,
    setWeavingClass,
    updateDeckSpells
  } = useDeck();

  const {
    rightSidebarOpen,
    leftPanelWidth,
    rightPanelWidth,
    isMobile,
    showNewDeckModal,
    showDeckSettingsModal,
    showBulkActionDialog,
    isEditingDeckName,
    toggleRightSidebar,
    setLeftPanelWidth,
    setRightPanelWidth,
    setShowNewDeckModal,
    setShowDeckSettingsModal,
    setShowBulkActionDialog,
    setIsEditingDeckName
  } = useUI();

  const [editedDeckName, setEditedDeckName] = useState(currentDeck.name);
  const [selectedSpellType, setSelectedSpellType] = useState<string | null>(
    null
  );
  const [bulkActionType, setBulkActionType] = useState<"edit" | "delete">(
    "edit"
  );
  const [isSpellId, setIsSpellId] = useState<boolean>(false);

  const handleSaveDeckName = () => {
    if (editedDeckName.trim()) {
      updateDeckName(editedDeckName);
    }
    setIsEditingDeckName(false);
  };

  const handleSort = (value: string) => {
    if (value === "none") {
      sortDeck("none", "asc");
      return;
    }

    const [by, order] = value.split("-") as [
      "school" | "pips" | "utility",
      "asc" | "desc"
    ];
    sortDeck(by, order);
  };

  const handleSelectSpellsByType = (
    typeId: string,
    actionType: "edit" | "delete",
    isSpellId = false
  ) => {
    setSelectedSpellType(typeId);
    setIsSpellId(isSpellId);
    setBulkActionType(actionType);
    setShowBulkActionDialog(true);
  };

  const handleDeleteSpellsByType = (typeId: string, isSpellId = false) => {
    const newSpells = isSpellId
      ? currentDeck.spells.filter((spell) => spell.id !== typeId)
      : currentDeck.spells.filter((spell) => spell.school !== typeId);
    updateDeckSpells(newSpells);
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
              <SpellSidebar currentDeck={currentDeck} onAddSpell={addSpell} />
            </div>
          </ResizablePanel>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <DeckHeader
            deck={currentDeck}
            isEditingDeckName={isEditingDeckName}
            setIsEditingDeckName={setIsEditingDeckName}
            editedDeckName={editedDeckName}
            setEditedDeckName={setEditedDeckName}
            onSaveDeckName={handleSaveDeckName}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onSelectSpellsByType={handleSelectSpellsByType}
            onDeleteSpellsByType={handleDeleteSpellsByType}
            showDeckSettingsModal={showDeckSettingsModal}
            setShowDeckSettingsModal={setShowDeckSettingsModal}
            wizardLevel={wizardLevel}
            setWizardLevel={setWizardLevel}
            wizardSchool={wizardSchool}
            setWizardSchool={setWizardSchool}
            weavingClass={weavingClass}
            setWeavingClass={setWeavingClass}
            decks={decks}
            onDeleteDeck={deleteDeck}
          />
          <div className="flex-1 overflow-y-auto p-4 md:px-6 md:pb-6 pt-0">
            <DeckGrid
              deck={currentDeck}
              onAddSpell={addSpellToSlot}
              onReplaceSpell={replaceSpell}
              onSortDeck={updateDeckSpells}
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
