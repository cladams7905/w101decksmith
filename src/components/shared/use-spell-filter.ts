import { useState, useCallback, useEffect } from "react";
import type { Spell } from "@/lib/types";
import { useSpellsData } from "@/lib/hooks/use-spells-data";

interface UseSpellFilterReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilters: Record<string, boolean>;
  setCategoryFilters: (filters: Record<string, boolean>) => void;
  filteredSpells: {
    id: string;
    name: string;
    color: string;
    spells: Spell[];
  }[];
  loading: boolean;
  error: string | null;
}

export function useSpellFilter(): UseSpellFilterReturn {
  const { spellCategories, loading, error } = useSpellsData();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<
    Record<string, boolean>
  >({});

  // Initialize category filters when spell categories are loaded
  useEffect(() => {
    if (
      spellCategories.length > 0 &&
      Object.keys(categoryFilters).length === 0
    ) {
      const initialFilters = spellCategories.reduce((acc, category) => {
        acc[category.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setCategoryFilters(initialFilters);
    }
  }, [spellCategories, categoryFilters]);

  const getFilteredSpells = useCallback(() => {
    return spellCategories
      .filter((category) => categoryFilters[category.id])
      .map((category) => ({
        ...category,
        spells: category.spells.filter(
          (spell: Spell) =>
            spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spell.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter((category) => category.spells.length > 0);
  }, [spellCategories, categoryFilters, searchQuery]);

  const [filteredSpells, setFilteredSpells] = useState(getFilteredSpells());

  useEffect(() => {
    setFilteredSpells(getFilteredSpells());
  }, [categoryFilters, searchQuery, getFilteredSpells]);

  return {
    searchQuery,
    setSearchQuery,
    categoryFilters,
    setCategoryFilters,
    filteredSpells,
    loading,
    error
  };
}
