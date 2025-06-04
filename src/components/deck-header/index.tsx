"use client";

import type React from "react";
import { Cog, Edit2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import DeckBreakdown from "@/components/deck-header/deck-breakdown";
import { DeckSettingsModal } from "@/components/deck-header/deck-settings-modal";
import { useDeck } from "@/lib/contexts/deck-context";
import { useUI } from "@/lib/contexts/ui-context";
import { useState } from "react";
import type { Spell } from "@/db/database.types";

function DeckNameEditor() {
  const { currentDeck, updateDeckName } = useDeck();
  const { isEditingDeckName, setIsEditingDeckName } = useUI();
  const [editedDeckName, setEditedDeckName] = useState(currentDeck.name);

  const handleSaveDeckName = () => {
    if (editedDeckName.trim()) {
      updateDeckName(editedDeckName);
    }
    setIsEditingDeckName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveDeckName();
    } else if (e.key === "Escape") {
      setEditedDeckName(currentDeck.name);
      setIsEditingDeckName(false);
    }
  };

  if (isEditingDeckName) {
    return (
      <div className="flex items-center">
        <Input
          value={editedDeckName}
          onChange={(e) => setEditedDeckName(e.target.value)}
          onBlur={handleSaveDeckName}
          onKeyDown={handleKeyDown}
          className="text-2xl font-bold h-auto py-1 px-2 w-64"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <h2 className="text-2xl font-bold ml-2">{currentDeck.name}</h2>
      <Button
        variant="ghost"
        size="icon"
        className="ml-2"
        onClick={() => setIsEditingDeckName(true)}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function DeckCardCount() {
  const { currentDeck } = useDeck();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-sm px-3 py-1 cursor-pointer hover:bg-accent/50 transition-colors"
        >
          {(currentDeck.spells as Spell[]).length} / 64 cards
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 rounded-lg" align="end">
        <DeckBreakdown deck={currentDeck} />
      </PopoverContent>
    </Popover>
  );
}

function DeckSortButton() {
  const { sortBy, sortOrder, sortDeck } = useDeck();

  const handleSort = (value: string) => {
    const [by, order] = value.split("-") as [
      "school" | "pips" | "utility",
      "asc" | "desc"
    ];
    sortDeck(by, order);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">
            {sortOrder === "asc" ? "↑" : "↓"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuLabel>Sort Deck</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={`${sortBy}-${sortOrder}`}
          onValueChange={handleSort}
        >
          <DropdownMenuLabel>School</DropdownMenuLabel>
          <DropdownMenuRadioItem value="school-asc">
            School (A-Z)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="school-desc">
            School (Z-A)
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Pip Cost</DropdownMenuLabel>
          <DropdownMenuRadioItem value="pips-asc">
            Pips (Low to High)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pips-desc">
            Pips (High to Low)
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Utility Type</DropdownMenuLabel>
          <DropdownMenuRadioItem value="utility-asc">
            Utility (Damage First)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="utility-desc">
            Utility (Support First)
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DeckSettingsButton() {
  const { showDeckSettingsModal, setShowDeckSettingsModal } = useUI();
  const {
    wizardLevel,
    setWizardLevel,
    wizardSchool,
    setWizardSchool,
    weavingClass,
    setWeavingClass,
    decks,
    deleteDeck
  } = useDeck();

  return (
    <Dialog
      open={showDeckSettingsModal}
      onOpenChange={setShowDeckSettingsModal}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Cog className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DeckSettingsModal
        wizardLevel={wizardLevel}
        setWizardLevel={setWizardLevel}
        wizardSchool={wizardSchool}
        setWizardSchool={setWizardSchool}
        weavingClass={weavingClass}
        setWeavingClass={setWeavingClass}
        decks={decks}
        onDeleteDeck={deleteDeck}
      />
    </Dialog>
  );
}

export function DeckHeader() {
  return (
    <div className="flex items-center justify-between p-4 md:px-6 md:pt-6 md:pb-4">
      <div className="flex items-center">
        <DeckNameEditor />
      </div>
      <div className="flex items-center gap-2">
        <DeckCardCount />
        <DeckSortButton />
        <DeckSettingsButton />
      </div>
    </div>
  );
}
