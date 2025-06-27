"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from "react";
import type { Spell, Deck } from "@/db/database.types";
import {
  updateDeck as updateDeckInDB,
  deleteDeck as deleteDeckInDB,
  createDeck
} from "@/db/actions/decks";
import { useToast } from "@/lib/hooks/use-toast";
import {
  getSpellPips,
  getSpellDamage,
  getSpellDamageOverTime,
  getSpellBuffPercentage,
  getSpellDebuffPercentage,
  getSpellHealing,
  getSpellHealingOverTime,
  getSpellPipsGained
} from "@/lib/spell-utils";
import { uiLogger } from "../logger";

interface DeckContextType {
  currentDeck: Deck;
  decks: Deck[];
  sortBy: "school" | "pips" | "utility";
  sortOrder: "asc" | "desc";
  addSpell: (spell: Spell, quantity: number) => void;
  addSpellToSlot: (spell: Spell, slotIndex: number, quantity?: number) => void;
  removeSpell: (index: number) => void;
  replaceSpell: (spellName: string, newSpell: Spell, index?: number) => void;
  createNewDeck: (deckData: {
    name: string;
    school: string;
    level: number;
    weavingSchool: string;
    description: string;
    isPvpDeck: boolean;
    isPublic: boolean;
    collections: string[];
  }) => Promise<Deck | null>;
  switchDeck: (deck: Deck) => void;
  updateDeck: (updates: Partial<Deck>) => Promise<void>;
  deleteDeck: () => void;
  sortDeck: (by: "school" | "pips" | "utility", order: "asc" | "desc") => void;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export function DeckProvider({
  children,
  deck
}: {
  children: React.ReactNode;
  deck?: Deck;
}) {
  const { toast } = useToast();
  const [currentDeck, setCurrentDeck] = useState<Deck>(
    deck || {
      id: 0,
      name: "New Deck",
      spells: [],
      school: "fire",
      level: 150,
      weaving_school: "fire",
      created_at: new Date().toISOString(),
      description: null,
      is_public: false,
      is_pve: false,
      user_id: "temp"
    } // default deck if none provided
  );

  const [decks, setDecks] = useState<Deck[]>([]);

  const [sortBy, setSortBy] = useState<"school" | "pips" | "utility">("school");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Update currentDeck when initialDeck changes (e.g., navigating between decks)
  useEffect(() => {
    if (deck && deck.id !== currentDeck.id) {
      setCurrentDeck(deck);
    }
  }, [deck, currentDeck.id]);

  // Auto-group spells based on current sorting selection whenever deck spells change
  useEffect(() => {
    if (currentDeck.spells.length === 0) return;

    setCurrentDeck((prev) => {
      // Create a sorted copy of spells based on current sorting selection
      const sortedSpells = [...prev.spells].sort((a, b) => {
        if (sortBy === "school") {
          const schoolA = (a.school || "unknown").toLowerCase();
          const schoolB = (b.school || "unknown").toLowerCase();
          const schoolComparison =
            sortOrder === "asc"
              ? schoolA.localeCompare(schoolB)
              : schoolB.localeCompare(schoolA);

          // If same school, sort by spell name to group identical spells together
          if (schoolComparison === 0) {
            return a.name.localeCompare(b.name);
          }

          return schoolComparison;
        } else if (sortBy === "pips") {
          const pipComparison =
            sortOrder === "asc"
              ? getSpellPips(a) - getSpellPips(b)
              : getSpellPips(b) - getSpellPips(a);

          // If same pip cost, sort by spell name to group identical spells together
          if (pipComparison === 0) {
            return a.name.localeCompare(b.name);
          }

          return pipComparison;
        } else if (sortBy === "utility") {
          const getUtilityType = (spell: Spell): number => {
            if (getSpellDamage(spell) > 0) return 1;
            if (getSpellDamageOverTime(spell) > 0) return 2;
            if (getSpellBuffPercentage(spell) > 0) return 3;
            if (getSpellDebuffPercentage(spell) > 0) return 4;
            if (getSpellHealing(spell) > 0) return 5;
            if (getSpellHealingOverTime(spell) > 0) return 6;
            if (getSpellPipsGained(spell) > 0) return 7;
            return 8;
          };

          const typeA = getUtilityType(a);
          const typeB = getUtilityType(b);
          const utilityComparison =
            sortOrder === "asc" ? typeA - typeB : typeB - typeA;

          // If same utility type, sort by spell name to group identical spells together
          if (utilityComparison === 0) {
            return a.name.localeCompare(b.name);
          }

          return utilityComparison;
        }

        return 0;
      });

      // Only update if the order actually changed
      const hasOrderChanged = prev.spells.some(
        (spell, index) =>
          !sortedSpells[index] ||
          spell.name !== sortedSpells[index].name ||
          spell.school !== sortedSpells[index].school
      );

      if (hasOrderChanged) {
        return { ...prev, spells: sortedSpells };
      }

      return prev;
    });

    // Also update the decks array
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id === currentDeck.id) {
          const sortedSpells = [...deck.spells].sort((a, b) => {
            if (sortBy === "school") {
              const schoolA = (a.school || "unknown").toLowerCase();
              const schoolB = (b.school || "unknown").toLowerCase();
              const schoolComparison =
                sortOrder === "asc"
                  ? schoolA.localeCompare(schoolB)
                  : schoolB.localeCompare(schoolA);

              if (schoolComparison === 0) {
                return a.name.localeCompare(b.name);
              }

              return schoolComparison;
            } else if (sortBy === "pips") {
              const pipComparison =
                sortOrder === "asc"
                  ? getSpellPips(a) - getSpellPips(b)
                  : getSpellPips(b) - getSpellPips(a);

              if (pipComparison === 0) {
                return a.name.localeCompare(b.name);
              }

              return pipComparison;
            } else if (sortBy === "utility") {
              const getUtilityType = (spell: Spell): number => {
                if (getSpellDamage(spell) > 0) return 1;
                if (getSpellDamageOverTime(spell) > 0) return 2;
                if (getSpellBuffPercentage(spell) > 0) return 3;
                if (getSpellDebuffPercentage(spell) > 0) return 4;
                if (getSpellHealing(spell) > 0) return 5;
                if (getSpellHealingOverTime(spell) > 0) return 6;
                if (getSpellPipsGained(spell) > 0) return 7;
                return 8;
              };

              const typeA = getUtilityType(a);
              const typeB = getUtilityType(b);
              const utilityComparison =
                sortOrder === "asc" ? typeA - typeB : typeB - typeA;

              if (utilityComparison === 0) {
                return a.name.localeCompare(b.name);
              }

              return utilityComparison;
            }

            return 0;
          });

          const hasOrderChanged = deck.spells.some(
            (spell, index) =>
              !sortedSpells[index] ||
              spell.name !== sortedSpells[index].name ||
              spell.school !== sortedSpells[index].school
          );

          if (hasOrderChanged) {
            return { ...deck, spells: sortedSpells };
          }
        }
        return deck;
      })
    );
  }, [currentDeck.spells, currentDeck.id, sortBy, sortOrder]); // Added sortBy and sortOrder to dependencies

  const addSpell = useCallback(
    (spell: Spell, quantity: number) => {
      setCurrentDeck((prev) => {
        if (prev.spells.length + quantity <= 64) {
          const spellsToAdd = Array(quantity).fill(spell);
          return {
            ...prev,
            spells: [...prev.spells, ...spellsToAdd]
          };
        }
        return prev;
      });

      setDecks((prev) =>
        prev.map((deck) => {
          if (deck.id === currentDeck.id) {
            if (deck.spells.length + quantity <= 64) {
              const spellsToAdd = Array(quantity).fill(spell);
              return {
                ...deck,
                spells: [...deck.spells, ...spellsToAdd]
              };
            }
          }
          return deck;
        })
      );
    },
    [currentDeck.id]
  );

  const addSpellToSlot = useCallback(
    (spell: Spell, slotIndex: number, quantity = 1) => {
      setCurrentDeck((prev) => {
        const newSpells = [...prev.spells];

        // Only add to slots that are actually empty (beyond current deck length)
        if (slotIndex >= newSpells.length) {
          // Add spells to the end of the deck
          for (let i = 0; i < quantity && newSpells.length < 64; i++) {
            newSpells.push(spell);
          }
        }
        // If slotIndex < newSpells.length, the slot is already occupied
        // and this should be handled by replaceSpell instead

        return {
          ...prev,
          spells: newSpells
        };
      });

      setDecks((prev) =>
        prev.map((deck) => {
          if (deck.id === currentDeck.id) {
            const newSpells = [...deck.spells];
            if (slotIndex >= newSpells.length) {
              for (let i = 0; i < quantity && newSpells.length < 64; i++) {
                newSpells.push(spell);
              }
            }
            return { ...deck, spells: newSpells };
          }
          return deck;
        })
      );
    },
    [currentDeck.id]
  );

  const removeSpell = useCallback(
    (index: number) => {
      setCurrentDeck((prev) => {
        const newSpells = [...prev.spells];
        newSpells.splice(index, 1);
        return { ...prev, spells: newSpells };
      });

      setDecks((prev) =>
        prev.map((deck) => {
          if (deck.id === currentDeck.id) {
            const newSpells = [...deck.spells];
            newSpells.splice(index, 1);
            return { ...deck, spells: newSpells };
          }
          return deck;
        })
      );
    },
    [currentDeck.id]
  );

  const replaceSpell = useCallback(
    (spellName: string, newSpell: Spell, index?: number) => {
      if (index !== undefined) {
        // Replace spell at specific index
        setCurrentDeck((prev) => {
          const newSpells = [...prev.spells];
          newSpells[index] = newSpell;
          return { ...prev, spells: newSpells };
        });

        setDecks((prev) =>
          prev.map((deck) =>
            deck.id === currentDeck.id
              ? {
                  ...deck,
                  spells: deck.spells.map((spell, i) =>
                    i === index ? newSpell : spell
                  )
                }
              : deck
          )
        );
      } else {
        // Replace all instances of the spell
        setCurrentDeck((prev) => ({
          ...prev,
          spells: prev.spells.map((spell) =>
            spell.name === spellName ? newSpell : spell
          )
        }));

        setDecks((prev) =>
          prev.map((deck) =>
            deck.id === currentDeck.id
              ? {
                  ...deck,
                  spells: deck.spells.map((spell) =>
                    spell.name === spellName ? newSpell : spell
                  )
                }
              : deck
          )
        );
      }
    },
    [currentDeck.id]
  );

  const createNewDeck = useCallback(
    async (deckData: {
      name: string;
      school: string;
      level: number;
      weavingSchool: string;
      description: string;
      isPvpDeck: boolean;
      isPublic: boolean;
      collections: string[];
    }) => {
      try {
        // Create the deck in the database
        const newDeck = await createDeck({
          name: deckData.name,
          school: deckData.school,
          level: deckData.level,
          weavingSchool: deckData.weavingSchool,
          description: deckData.description,
          isPvpDeck: deckData.isPvpDeck,
          isPublic: deckData.isPublic,
          collections: deckData.collections
        });

        if (newDeck) {
          // Add to local state
          setDecks((prev) => [...prev, newDeck]);
          setCurrentDeck(newDeck);

          // Show success toast
          toast({
            variant: "success",
            title: "Deck created",
            description: `"${deckData.name}" has been created successfully.`
          });

          return newDeck;
        }

        return null;
      } catch (error) {
        console.error("Error creating deck:", error);
        toast({
          variant: "destructive",
          title: "Failed to create deck",
          description:
            "There was an error creating your deck. Please try again."
        });
        return null;
      }
    },
    [toast]
  );

  const switchDeck = useCallback((deck: Deck) => {
    setCurrentDeck(deck);
  }, []);

  const updateDeck = useCallback(
    async (updates: Partial<Deck>) => {
      try {
        // First update the database
        if (currentDeck.id !== 0) {
          // Don't try to update temp/default decks
          await updateDeckInDB(currentDeck.id, updates);
        }

        // Then update the local state
        setCurrentDeck((prev) => ({ ...prev, ...updates }));

        // Update the deck in the decks array
        setDecks((prev) =>
          prev.map((deck) =>
            deck.id === currentDeck.id ? { ...deck, ...updates } : deck
          )
        );
      } catch (error) {
        console.error("Failed to update deck:", error);
        toast({
          variant: "destructive",
          title: "Failed to save deck",
          description:
            "There was an error saving your deck changes. Please try again."
        });
        throw error; // Re-throw so calling code can handle the error
      }
    },
    [currentDeck.id, toast] // Use toast dependency
  );

  const deleteDeck = useCallback(async () => {
    try {
      // First delete from database
      if (currentDeck.id !== 0) {
        // Don't try to delete temp/default decks
        await deleteDeckInDB(currentDeck.id);
      }

      // Then update local state
      setDecks((prev) => {
        const updatedDecks = prev.filter((deck) => deck.id !== currentDeck.id);

        // If there are remaining decks, switch to the first one
        if (updatedDecks.length > 0) {
          setCurrentDeck(updatedDecks[0]);
        }

        return updatedDecks;
      });

      // Show success toast
      toast({
        variant: "success",
        title: "Deck deleted",
        description: `"${currentDeck.name}" has been deleted successfully.`
      });
    } catch (error) {
      console.error("Failed to delete deck:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete deck",
        description: "There was an error deleting your deck. Please try again."
      });
    }
  }, [currentDeck.id, currentDeck.name, toast]); // Include toast dependency

  const sortDeckSpells = useCallback(
    (by: "school" | "pips" | "utility", order: "asc" | "desc") => {
      setSortBy(by);
      setSortOrder(order);

      // Use callback form to access current deck without dependency
      setCurrentDeck((prev) => {
        const sortedSpells = [...prev.spells].sort((a, b) => {
          if (by === "school") {
            const schoolA = (a.school || "unknown").toLowerCase();
            const schoolB = (b.school || "unknown").toLowerCase();
            return order === "asc"
              ? schoolA.localeCompare(schoolB)
              : schoolB.localeCompare(schoolA);
          } else if (by === "pips") {
            return order === "asc"
              ? getSpellPips(a) - getSpellPips(b)
              : getSpellPips(b) - getSpellPips(a);
          } else if (by === "utility") {
            const getUtilityType = (spell: Spell): number => {
              if (getSpellDamage(spell) > 0) return 1;
              if (getSpellDamageOverTime(spell) > 0) return 2;
              if (getSpellBuffPercentage(spell) > 0) return 3;
              if (getSpellDebuffPercentage(spell) > 0) return 4;
              if (getSpellHealing(spell) > 0) return 5;
              if (getSpellHealingOverTime(spell) > 0) return 6;
              if (getSpellPipsGained(spell) > 0) return 7;
              return 8;
            };

            const typeA = getUtilityType(a);
            const typeB = getUtilityType(b);
            return order === "asc" ? typeA - typeB : typeB - typeA;
          }
          return 0;
        });

        return { ...prev, spells: sortedSpells };
      });

      // Update decks array with sorted spells
      setDecks((prev) =>
        prev.map((deck) => {
          if (deck.id === currentDeck.id) {
            const sortedSpells = [...deck.spells].sort((a, b) => {
              if (by === "school") {
                const schoolA = (a.school || "unknown").toLowerCase();
                const schoolB = (b.school || "unknown").toLowerCase();
                return order === "asc"
                  ? schoolA.localeCompare(schoolB)
                  : schoolB.localeCompare(schoolA);
              } else if (by === "pips") {
                return order === "asc"
                  ? getSpellPips(a) - getSpellPips(b)
                  : getSpellPips(b) - getSpellPips(a);
              } else if (by === "utility") {
                const getUtilityType = (spell: Spell): number => {
                  if (getSpellDamage(spell) > 0) return 1;
                  if (getSpellDamageOverTime(spell) > 0) return 2;
                  if (getSpellBuffPercentage(spell) > 0) return 3;
                  if (getSpellDebuffPercentage(spell) > 0) return 4;
                  if (getSpellHealing(spell) > 0) return 5;
                  if (getSpellHealingOverTime(spell) > 0) return 6;
                  if (getSpellPipsGained(spell) > 0) return 7;
                  return 8;
                };

                const typeA = getUtilityType(a);
                const typeB = getUtilityType(b);
                return order === "asc" ? typeA - typeB : typeB - typeA;
              }
              return 0;
            });
            return { ...deck, spells: sortedSpells };
          }
          return deck;
        })
      );
    },
    [currentDeck.id] // Only depend on currentDeck.id which is stable
  );

  const value = React.useMemo(
    () => ({
      currentDeck,
      decks,
      sortBy,
      sortOrder,
      addSpell,
      addSpellToSlot,
      removeSpell,
      replaceSpell,
      createNewDeck,
      switchDeck,
      updateDeck,
      deleteDeck,
      sortDeck: sortDeckSpells
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDeck, decks, sortBy, sortOrder]
  );

  // Debug logging for context value changes - add dependency array to prevent running on every render
  React.useEffect(
    () => {
      uiLogger.debug(`🔄 DeckContext value recreated:`, {
        currentDeckId: currentDeck.id,
        currentDeckSpellsLength: currentDeck.spells.length,
        addSpellRef: addSpell.toString().slice(0, 50),
        timestamp: Date.now()
      });
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDeck.id, currentDeck.spells.length]
  ); // Only log when deck actually changes - removed addSpell to prevent circular logging

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error("useDeck must be used within a DeckProvider");
  }
  return context;
}
