import { Spell } from "@/db/database.types";

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
