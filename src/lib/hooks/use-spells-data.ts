import { useState, useEffect, useCallback } from "react";
import { getAllSpells } from "@/db/actions/spells";
import type { Spell, SpellCategory } from "@/lib/types";

// School color mapping
const SCHOOL_COLORS: Record<string, string> = {
  fire: "red",
  ice: "blue",
  storm: "purple",
  life: "green",
  myth: "yellow",
  death: "gray",
  balance: "orange",
  astral: "purple",
  shadow: "black"
};

// Organize spells by school
function organizeSpellsBySchool(spells: Spell[]): SpellCategory[] {
  const spellsBySchool: Record<string, Spell[]> = {};

  spells.forEach((spell) => {
    const school = spell.school || "balance";
    if (!spellsBySchool[school]) {
      spellsBySchool[school] = [];
    }
    spellsBySchool[school].push(spell);
  });

  return Object.entries(spellsBySchool).map(([schoolId, schoolSpells]) => ({
    id: schoolId,
    name: schoolId.charAt(0).toUpperCase() + schoolId.slice(1),
    color: SCHOOL_COLORS[schoolId] || "gray",
    spells: schoolSpells
  }));
}

interface UseSpellsDataReturn {
  spellCategories: SpellCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSpellsData(): UseSpellsDataReturn {
  const [spellCategories, setSpellCategories] = useState<SpellCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpells = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const spells = await getAllSpells();
      const categories = organizeSpellsBySchool(spells);
      setSpellCategories(categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch spells");
      console.error("Error fetching spells:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpells();
  }, [fetchSpells]);

  return {
    spellCategories,
    loading,
    error,
    refetch: fetchSpells
  };
}
