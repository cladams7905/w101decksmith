"use client";

import { useState } from "react";
import { Search, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Deck } from "@/db/database.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface MyDecksDropdownProps {
  decks: Deck[];
  currentDeck: Deck;
  onSwitchDeck: (deck: Deck) => void;
  showNewDeckModal: boolean;
  setShowNewDeckModal: (show: boolean) => void;
  // onCreateDeck: (deckData: {
  //   name: string;
  //   school: School;
  //   level: number;
  //   weavingSchool?: School;
  //   description?: string;
  //   isPvE: boolean;
  //   isPublic: boolean;
  //   canComment: boolean;
  // }) => Promise<void>;
  wizardSchool: string;
  wizardLevel: string;
  weavingClass: string;
  isActive?: boolean;
}

export function MyDecksDropdown({
  decks,
  currentDeck,
  onSwitchDeck,
  setShowNewDeckModal,
  wizardSchool,
  wizardLevel,
  weavingClass,
  isActive = false
}: MyDecksDropdownProps) {
  const [deckSearchQuery, setDeckSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(deckSearchQuery.toLowerCase())
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        asChild
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Button
          variant="ghost"
          className={`hidden md:flex relative ${
            isActive
              ? "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-primary"
              : ""
          }`}
        >
          My Decks
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[450px]"
        align="start"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <DropdownMenuLabel>My Decks</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-2">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search decks..."
              className="pl-8"
              value={deckSearchQuery}
              onChange={(e) => setDeckSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <DropdownMenuGroup>
          <div className="max-h-[350px] overflow-y-auto px-2 pb-2">
            {filteredDecks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>No decks found. Create a new deck to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredDecks.map((deck) => (
                  <Card
                    key={deck.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      deck.id === currentDeck.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      onSwitchDeck(deck);
                      setIsOpen(false);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full bg-${
                            deck.school || wizardSchool
                          }-700 flex items-center justify-center text-white font-bold`}
                        >
                          {(deck.school || wizardSchool)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {deck.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Level {deck.level || wizardLevel}{" "}
                            {deck.weaving_school || weavingClass}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {deck.spells.length}/64 cards
                        </Badge>

                        {deck.id === currentDeck.id && (
                          <Badge className="bg-primary">Current</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <div className="p-2">
          <Button
            variant="default"
            className="w-full bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.preventDefault();
              setShowNewDeckModal(true);
              setIsOpen(false);
            }}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Create New Deck
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
