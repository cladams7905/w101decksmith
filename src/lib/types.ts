import { Database } from "@/db/database.types";

export type Spell = Database["public"]["Tables"]["spells"]["Row"];
export type SpellInsert = Database["public"]["Tables"]["spells"]["Insert"];
export type SpellUpdate = Database["public"]["Tables"]["spells"]["Update"];

export interface SpellCategory {
  id: string;
  name: string;
  color: string;
  spells: Spell[];
}

// Update the Deck interface to include rightSidebarOpen
export interface Deck {
  id: string;
  name: string;
  spells: Spell[];
  school?: string;
  level?: string;
  weavingClass?: string;
  rightSidebarOpen?: boolean;
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
