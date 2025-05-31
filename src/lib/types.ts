import { Database } from "@/db/database.types";

export type Spell = Database["public"]["Tables"]["spells"]["Row"];
export type SpellInsert = Database["public"]["Tables"]["spells"]["Insert"];
export type SpellUpdate = Database["public"]["Tables"]["spells"]["Update"];

export type Deck = Database["public"]["Tables"]["decks"]["Row"];
export type DeckInsert = Database["public"]["Tables"]["decks"]["Insert"];
export type DeckUpdate = Database["public"]["Tables"]["decks"]["Update"];

export type School = Database["public"]["Enums"]["school"];

export interface SpellCategory {
  id: string;
  name: string;
  color: string;
  spells: Spell[];
}

export interface UtilityMetrics {
  dpp: number; // Damage Per Pip
  dot: number; // Damage Over Time
  buff: number; // Buff Utility
  debuff: number; // Debuff Utility
  hpp: number; // Healing Per Pip
  hot: number; // Healing Over Time
  pip: number; // Pip Utility
}
