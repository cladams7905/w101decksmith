"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ResizablePanel } from "@/components/resizable-panel";
import DeckGrid from "@/components/deck-grid";
import type { Spell, Deck } from "@/lib/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/app-header";
import { DeckHeader } from "@/components/deck-header";
import { RightSidebar } from "@/components/right-sidebar";
import { BulkActionDialog } from "@/components/bulk-action-dialog";
import { SpellSidebar } from "@/components/spell-sidebar/spell-sidebar";

export default function DeckBuilder() {
  const [currentDeck, setCurrentDeck] = useState<Deck>({
    id: "1",
    name: "Fire PvP Deck",
    spells: [],
    rightSidebarOpen: true
  });
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: "1",
      name: "Fire PvP Deck",
      spells: [],
      school: "fire",
      level: "150",
      weavingClass: "pyromancer"
    },
    {
      id: "2",
      name: "Ice Tank Deck",
      spells: [],
      school: "ice",
      level: "140",
      weavingClass: "thaumaturge"
    },
    {
      id: "3",
      name: "Storm Damage Deck",
      spells: [],
      school: "storm",
      level: "160",
      weavingClass: "diviner"
    },
    {
      id: "4",
      name: "Life Healing Deck",
      spells: [],
      school: "life",
      level: "150",
      weavingClass: "theurgist"
    }
  ]);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [showDeckSwitchModal, setShowDeckSwitchModal] = useState(false);
  const [showDeckSettingsModal, setShowDeckSettingsModal] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState(currentDeck.name);
  const [wizardLevel, setWizardLevel] = useState("150");
  const [wizardSchool, setWizardSchool] = useState("fire");
  const [weavingClass, setWeavingClass] = useState("pyromancer");
  const [sortBy, setSortBy] = useState<"school" | "pips" | "utility" | "none">(
    "none"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedSpellType, setSelectedSpellType] = useState<string | null>(
    null
  );
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"edit" | "delete">(
    "edit"
  );
  const [isSpellId, setIsSpellId] = useState<boolean>(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setRightSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update edited deck name when current deck changes
  useEffect(() => {
    setEditedDeckName(currentDeck.name);
  }, [currentDeck]);

  const handleAddSpell = (spell: Spell, quantity: number) => {
    if (currentDeck.spells.length + quantity <= 64) {
      const spellsToAdd = Array(quantity).fill(spell);

      setCurrentDeck({
        ...currentDeck,
        spells: [...currentDeck.spells, ...spellsToAdd]
      });

      const updatedDecks = decks.map((deck) =>
        deck.id === currentDeck.id
          ? { ...deck, spells: [...deck.spells, ...spellsToAdd] }
          : deck
      );
      setDecks(updatedDecks);
    }
  };

  const handleAddSpellToSlot = (
    spell: Spell,
    slotIndex: number,
    quantity = 1
  ) => {
    const newSpells = [...currentDeck.spells];
    const startIndex = newSpells.length;

    for (let i = 0; i < quantity; i++) {
      if (startIndex + i < 64) {
        newSpells[startIndex + i] = spell;
      }
    }

    setCurrentDeck({
      ...currentDeck,
      spells: newSpells
    });

    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
    );
    setDecks(updatedDecks);
  };

  const handleReplaceSpell = (spell: Spell, index: number) => {
    const newSpells = [...currentDeck.spells];

    if (index < newSpells.length) {
      newSpells[index] = spell;
    }

    setCurrentDeck({
      ...currentDeck,
      spells: newSpells
    });

    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
    );
    setDecks(updatedDecks);
  };

  const handleCreateNewDeck = () => {
    const name = "New Deck"; // Default name
    const newDeck = {
      id: Date.now().toString(),
      name,
      spells: [],
      school: wizardSchool,
      level: wizardLevel,
      weavingClass: weavingClass
    };
    setDecks([...decks, newDeck]);
    setCurrentDeck(newDeck);
    setShowNewDeckModal(false);
  };

  const handleSwitchDeck = (deck: Deck) => {
    setCurrentDeck(deck);
    setShowDeckSwitchModal(false);
  };

  const toggleRightSidebar = () => {
    if (!rightSidebarOpen && rightPanelWidth === 0) {
      setRightPanelWidth(280);
    }

    setRightSidebarOpen(!rightSidebarOpen);

    setCurrentDeck({
      ...currentDeck,
      rightSidebarOpen: !rightSidebarOpen
    });
  };

  const handleSaveDeckName = () => {
    if (editedDeckName.trim()) {
      const updatedDeck = { ...currentDeck, name: editedDeckName };
      setCurrentDeck(updatedDeck);

      const updatedDecks = decks.map((deck) =>
        deck.id === currentDeck.id ? updatedDeck : deck
      );
      setDecks(updatedDecks);
    }
    setIsEditingDeckName(false);
  };

  const handleSort = (value: string) => {
    if (value === "none") {
      setSortBy("none");
      return;
    }

    const [by, order] = value.split("-") as [
      "school" | "pips" | "utility",
      "asc" | "desc"
    ];
    setSortBy(by);
    setSortOrder(order);
    sortDeck(by, order);
  };

  const sortDeck = (
    by: "school" | "pips" | "utility" | "none",
    order: "asc" | "desc"
  ) => {
    if (by === "none") return;

    const sortedSpells = [...currentDeck.spells].sort((a, b) => {
      if (by === "school") {
        const schoolA = a.school.toLowerCase();
        const schoolB = b.school.toLowerCase();
        return order === "asc"
          ? schoolA.localeCompare(schoolB)
          : schoolB.localeCompare(schoolA);
      } else if (by === "pips") {
        return order === "asc" ? a.pips - b.pips : b.pips - a.pips;
      } else if (by === "utility") {
        const getUtilityType = (spell: Spell): number => {
          if (spell.damage && spell.damage > 0) return 1;
          if (spell.damageOverTime && spell.damageOverTime > 0) return 2;
          if (spell.buffPercentage && spell.buffPercentage > 0) return 3;
          if (spell.debuffPercentage && spell.debuffPercentage > 0) return 4;
          if (spell.healing && spell.healing > 0) return 5;
          if (spell.healingOverTime && spell.healingOverTime > 0) return 6;
          if (spell.pipsGained && spell.pipsGained > 0) return 7;
          return 8;
        };

        const typeA = getUtilityType(a);
        const typeB = getUtilityType(b);
        return order === "asc" ? typeA - typeB : typeB - typeA;
      }
      return 0;
    });

    setCurrentDeck({
      ...currentDeck,
      spells: sortedSpells
    });

    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: sortedSpells } : deck
    );
    setDecks(updatedDecks);
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

    setCurrentDeck({
      ...currentDeck,
      spells: newSpells
    });

    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
    );
    setDecks(updatedDecks);
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

    setCurrentDeck({
      ...currentDeck,
      spells: newSpells
    });

    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
    );
    setDecks(updatedDecks);

    setShowBulkActionDialog(false);
    setSelectedSpellType(null);
  };

  function handleDeleteDeck() {
    if (decks.length <= 1) {
      return;
    }

    const updatedDecks = decks.filter((deck) => deck.id !== currentDeck.id);
    setDecks(updatedDecks);
    setCurrentDeck(updatedDecks[0]);
    setShowDeckSettingsModal(false);
  }

  const handleSortDeck = (sortedSpells: Spell[]) => {
    setCurrentDeck({
      ...currentDeck,
      spells: sortedSpells
    });

    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: sortedSpells } : deck
    );
    setDecks(updatedDecks);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
        <AppHeader
          currentDeck={currentDeck}
          decks={decks}
          onSwitchDeck={handleSwitchDeck}
          onCreateDeck={handleCreateNewDeck}
          onToggleRightSidebar={toggleRightSidebar}
          renderSidebarContent={() => (
            <SpellSidebar
              currentDeck={currentDeck}
              onAddSpell={handleAddSpell}
            />
          )}
          showNewDeckModal={showNewDeckModal}
          setShowNewDeckModal={setShowNewDeckModal}
          showDeckSwitchModal={showDeckSwitchModal}
          setShowDeckSwitchModal={setShowDeckSwitchModal}
          wizardSchool={wizardSchool}
          wizardLevel={wizardLevel}
          weavingClass={weavingClass}
        />

        <div className="flex flex-1 overflow-hidden">
          <SidebarProvider>
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
                  <div className="flex-1 overflow-auto">
                    <SpellSidebar
                      currentDeck={currentDeck}
                      onAddSpell={handleAddSpell}
                    />
                  </div>
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
                onDeleteDeck={handleDeleteDeck}
              />
              <div className="flex-1 overflow-auto p-4 md:px-6 md:pb-6 pt-0">
                <DeckGrid
                  deck={currentDeck}
                  onAddSpell={handleAddSpellToSlot}
                  onReplaceSpell={handleReplaceSpell}
                  onSortDeck={handleSortDeck}
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
          </SidebarProvider>
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
    </TooltipProvider>
  );
}
