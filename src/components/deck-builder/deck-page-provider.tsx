"use client";

import { createContext, useContext } from "react";
import { useDeck } from "@/lib/contexts/deck-context";
import { useUI } from "@/lib/contexts/ui-context";
import type { Deck } from "@/db/database.types";

interface DeckPageContextType {
  currentDeck: Deck;
  decks: Deck[];
  onSwitchDeck: (deck: Deck) => void;
  onToggleRightSidebar: () => void;
  rightSidebarOpen: boolean;
  showNewDeckModal: boolean;
  setShowNewDeckModal: (show: boolean) => void;
  wizardSchool: string;
  wizardLevel: string;
  weavingClass: string;
}

const DeckPageContext = createContext<DeckPageContextType | null>(null);

export function useDeckPageContext() {
  const context = useContext(DeckPageContext);
  if (!context) {
    throw new Error(
      "useDeckPageContext must be used within a DeckPageProvider"
    );
  }
  return context;
}

export function useDeckPageContextOptional() {
  return useContext(DeckPageContext);
}

export function DeckPageProvider({ children }: { children: React.ReactNode }) {
  const {
    currentDeck,
    decks,
    wizardLevel,
    wizardSchool,
    weavingClass,
    switchDeck
  } = useDeck();

  const {
    showNewDeckModal,
    toggleRightSidebar,
    setShowNewDeckModal,
    rightSidebarOpen
  } = useUI();

  const contextValue: DeckPageContextType = {
    currentDeck,
    decks,
    onSwitchDeck: switchDeck,
    onToggleRightSidebar: toggleRightSidebar,
    rightSidebarOpen,
    showNewDeckModal,
    setShowNewDeckModal,
    wizardSchool,
    wizardLevel,
    weavingClass
  };

  return (
    <DeckPageContext.Provider value={contextValue}>
      {children}
    </DeckPageContext.Provider>
  );
}
