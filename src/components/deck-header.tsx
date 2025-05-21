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
import type { Deck } from "@/lib/types";
import DeckBreakdown from "@/components/deck-breakdown";
import { DeckSettingsModal } from "@/components/deck-settings-modal";

interface DeckHeaderProps {
  deck: Deck;
  isEditingDeckName: boolean;
  setIsEditingDeckName: (editing: boolean) => void;
  editedDeckName: string;
  setEditedDeckName: (name: string) => void;
  onSaveDeckName: () => void;
  sortBy: "school" | "pips" | "utility" | "none";
  sortOrder: "asc" | "desc";
  onSort: (value: string) => void;
  onSelectSpellsByType: (
    typeId: string,
    actionType: "edit" | "delete",
    isSpellId?: boolean
  ) => void;
  onDeleteSpellsByType: (typeId: string, isSpellId?: boolean) => void;
  showDeckSettingsModal: boolean;
  setShowDeckSettingsModal: (show: boolean) => void;
  wizardLevel: string;
  setWizardLevel: (level: string) => void;
  wizardSchool: string;
  setWizardSchool: (school: string) => void;
  weavingClass: string;
  setWeavingClass: (weavingClass: string) => void;
  decks: Deck[];
  onDeleteDeck: () => void;
}

export function DeckHeader({
  deck,
  isEditingDeckName,
  setIsEditingDeckName,
  editedDeckName,
  setEditedDeckName,
  onSaveDeckName,
  sortBy,
  sortOrder,
  onSort,
  onSelectSpellsByType,
  onDeleteSpellsByType,
  showDeckSettingsModal,
  setShowDeckSettingsModal,
  wizardLevel,
  setWizardLevel,
  wizardSchool,
  setWizardSchool,
  weavingClass,
  setWeavingClass,
  decks,
  onDeleteDeck
}: DeckHeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSaveDeckName();
    } else if (e.key === "Escape") {
      setEditedDeckName(deck.name);
      setIsEditingDeckName(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 md:px-6 md:pt-6 md:pb-4">
      <div className="flex items-center">
        {isEditingDeckName ? (
          <div className="flex items-center">
            <Input
              value={editedDeckName}
              onChange={(e) => setEditedDeckName(e.target.value)}
              onBlur={onSaveDeckName}
              onKeyDown={handleKeyDown}
              className="text-2xl font-bold h-auto py-1 px-2 w-64"
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center">
            <h2 className="text-2xl font-bold ml-2">{deck.name}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setIsEditingDeckName(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="text-sm px-3 py-1 cursor-pointer hover:bg-accent/50 transition-colors"
            >
              {deck.spells.length} / 64 cards
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <DeckBreakdown
              deck={deck}
              onSelectSpells={onSelectSpellsByType}
              onDeleteSpells={onDeleteSpellsByType}
            />
          </PopoverContent>
        </Popover>

        {/* Sort button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-5 w-5" />
              {sortBy !== "none" && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort Deck</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={`${sortBy}-${sortOrder}`}
              onValueChange={onSort}
            >
              <DropdownMenuRadioItem value="none">
                No Sorting
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
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
            onDeleteDeck={onDeleteDeck}
          />
        </Dialog>
      </div>
    </div>
  );
}
