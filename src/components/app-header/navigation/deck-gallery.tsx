"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { Deck, School, Spell } from "@/lib/types";
import { NewDeckModal } from "@/components/app-header/navigation/new-deck-modal";

interface DeckGalleryProps {
  decks: Deck[];
  currentDeck: Deck;
  onSwitchDeck: (deck: Deck) => void;
  showNewDeckModal: boolean;
  setShowNewDeckModal: (show: boolean) => void;
  onCreateDeck: (deckData: {
    name: string;
    school: School;
    level: number;
    weavingSchool?: School;
    description?: string;
    isPvE: boolean;
    isPublic: boolean;
    canComment: boolean;
  }) => Promise<void>;
  wizardSchool: string;
  wizardLevel: string;
  weavingClass: string;
}

export function DeckGallery({
  decks,
  currentDeck,
  onSwitchDeck,
  showNewDeckModal,
  setShowNewDeckModal,
  onCreateDeck,
  wizardSchool,
  wizardLevel,
  weavingClass
}: DeckGalleryProps) {
  const [deckSearchQuery, setDeckSearchQuery] = useState("");
  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(deckSearchQuery.toLowerCase())
  );

  return (
    <DialogContent className="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>My Decks</DialogTitle>
      </DialogHeader>
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search decks..."
          className="pl-8"
          value={deckSearchQuery}
          onChange={(e) => setDeckSearchQuery(e.target.value)}
        />
      </div>

      {filteredDecks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No decks found. Create a new deck to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
          {filteredDecks.map((deck) => (
            <Card
              key={deck.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                deck.id === currentDeck.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSwitchDeck(deck)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-${
                      deck.school || wizardSchool
                    }-700 flex items-center justify-center text-white font-bold`}
                  >
                    {(deck.school || wizardSchool).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{deck.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Level {deck.level || wizardLevel}{" "}
                      {deck.weaving_school || weavingClass}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {(deck.spells as Spell[]).length}/64 cards
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

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-muted-foreground">
          {filteredDecks.length} {filteredDecks.length === 1 ? "deck" : "decks"}{" "}
          total
        </p>
        <NewDeckModal
          showModal={showNewDeckModal}
          setShowModal={setShowNewDeckModal}
          onCreateDeck={onCreateDeck}
          triggerButton={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Deck
            </Button>
          }
        />
      </div>
    </DialogContent>
  );
}
