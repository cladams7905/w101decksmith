import React, { createContext, useContext, useState, useCallback } from "react";
import type { Spell, Deck } from "@/lib/types";
import { deckLogger } from "@/lib/logger";

interface DeckContextType {
  currentDeck: Deck;
  decks: Deck[];
  wizardLevel: string;
  wizardSchool: string;
  weavingClass: string;
  sortBy: "school" | "pips" | "utility" | "none";
  sortOrder: "asc" | "desc";
  addSpell: (spell: Spell, quantity: number) => void;
  addSpellToSlot: (spell: Spell, slotIndex: number, quantity?: number) => void;
  replaceSpell: (spell: Spell, index: number) => void;
  createNewDeck: () => void;
  switchDeck: (deck: Deck) => void;
  updateDeckName: (name: string) => void;
  deleteDeck: () => void;
  sortDeck: (
    by: "school" | "pips" | "utility" | "none",
    order: "asc" | "desc"
  ) => void;
  setWizardLevel: (level: string) => void;
  setWizardSchool: (school: string) => void;
  setWeavingClass: (weavingClass: string) => void;
  updateDeckSpells: (spells: Spell[]) => void;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export function DeckProvider({ children }: { children: React.ReactNode }) {
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

  const [wizardLevel, setWizardLevel] = useState("150");
  const [wizardSchool, setWizardSchool] = useState("fire");
  const [weavingClass, setWeavingClass] = useState("pyromancer");
  const [sortBy, setSortBy] = useState<"school" | "pips" | "utility" | "none">(
    "none"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const addSpell = useCallback(
    (spell: Spell, quantity: number) => {
      if (currentDeck.spells.length + quantity <= 64) {
        const spellsToAdd = Array(quantity).fill(spell);
        setCurrentDeck((prev) => ({
          ...prev,
          spells: [...prev.spells, ...spellsToAdd]
        }));

        setDecks((prev) =>
          prev.map((deck) =>
            deck.id === currentDeck.id
              ? { ...deck, spells: [...deck.spells, ...spellsToAdd] }
              : deck
          )
        );
      }
    },
    [currentDeck.id, currentDeck.spells.length]
  );

  const addSpellToSlot = useCallback(
    (spell: Spell, slotIndex: number, quantity = 1) => {
      const newSpells = [...currentDeck.spells];

      // Add the specified quantity of spells to the end of the deck
      for (let i = 0; i < quantity; i++) {
        if (newSpells.length < 64) {
          newSpells.push(spell);
        }
      }

      setCurrentDeck((prev) => ({
        ...prev,
        spells: newSpells
      }));

      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
        )
      );
    },
    [currentDeck.id, currentDeck.spells]
  );

  const replaceSpell = useCallback(
    (spell: Spell, index: number) => {
      deckLogger.info("=== replaceSpell function called ===");
      deckLogger.info("Trying to replace at deck index:", index);
      deckLogger.info("With spell:", spell.name);
      deckLogger.info(
        "Current deck before replace:",
        currentDeck.spells.map((s, i) => ({
          deckIndex: i,
          name: s.name,
          id: s.id,
          isTargetIndex: i === index
        }))
      );

      const newSpells = [...currentDeck.spells];
      if (index < newSpells.length) {
        const oldSpell = newSpells[index];
        newSpells[index] = spell;
        deckLogger.info(
          `Successfully replaced deck[${index}]: "${oldSpell.name}" -> "${spell.name}"`
        );
      } else {
        deckLogger.error(
          `ERROR: Index ${index} is out of bounds (deck length: ${newSpells.length})`
        );
      }

      deckLogger.info(
        "New deck after replace:",
        newSpells.map((s, i) => ({
          deckIndex: i,
          name: s.name,
          id: s.id
        }))
      );

      setCurrentDeck((prev) => ({
        ...prev,
        spells: newSpells
      }));

      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
        )
      );

      deckLogger.info("=== replaceSpell completed ===");
    },
    [currentDeck.id, currentDeck.spells]
  );

  const createNewDeck = useCallback(() => {
    const newDeck = {
      id: Date.now().toString(),
      name: "New Deck",
      spells: [],
      school: wizardSchool,
      level: wizardLevel,
      weavingClass: weavingClass
    };
    setDecks((prev) => [...prev, newDeck]);
    setCurrentDeck(newDeck);
  }, [wizardSchool, wizardLevel, weavingClass]);

  const switchDeck = useCallback((deck: Deck) => {
    setCurrentDeck(deck);
  }, []);

  const updateDeckName = useCallback(
    (name: string) => {
      if (name.trim()) {
        const updatedDeck = { ...currentDeck, name };
        setCurrentDeck(updatedDeck);
        setDecks((prev) =>
          prev.map((deck) => (deck.id === currentDeck.id ? updatedDeck : deck))
        );
      }
    },
    [currentDeck]
  );

  const deleteDeck = useCallback(() => {
    if (decks.length <= 1) return;

    const updatedDecks = decks.filter((deck) => deck.id !== currentDeck.id);
    setDecks(updatedDecks);
    setCurrentDeck(updatedDecks[0]);
  }, [currentDeck.id, decks]);

  const updateDeckSpells = useCallback(
    (spells: Spell[]) => {
      setCurrentDeck((prev) => ({
        ...prev,
        spells
      }));

      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === currentDeck.id ? { ...deck, spells } : deck
        )
      );
    },
    [currentDeck.id]
  );

  const sortDeckSpells = useCallback(
    (by: "school" | "pips" | "utility" | "none", order: "asc" | "desc") => {
      if (by === "none") return;

      setSortBy(by);
      setSortOrder(order);

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

      updateDeckSpells(sortedSpells);
    },
    [currentDeck.spells, updateDeckSpells]
  );

  const value = {
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
    sortDeck: sortDeckSpells,
    setWizardLevel,
    setWizardSchool,
    setWeavingClass,
    updateDeckSpells
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error("useDeck must be used within a DeckProvider");
  }
  return context;
}
