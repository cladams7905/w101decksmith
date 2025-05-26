import { useState, useCallback, useEffect } from "react";
import type { Spell } from "@/lib/types";
import { spellCategories } from "@/db/data";

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
}

export function useSpellFilter(): UseSpellFilterReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<
    Record<string, boolean>
  >(
    spellCategories.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const getFilteredSpells = useCallback(() => {
    return spellCategories
      .filter((category) => categoryFilters[category.id])
      .map((category) => ({
        ...category,
        spells: category.spells.filter(
          (spell: Spell) =>
            spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spell.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter((category) => category.spells.length > 0);
  }, [categoryFilters, searchQuery]);

  const [filteredSpells, setFilteredSpells] = useState(getFilteredSpells());

  useEffect(() => {
    setFilteredSpells(getFilteredSpells());
  }, [categoryFilters, searchQuery, getFilteredSpells]);

  return {
    searchQuery,
    setSearchQuery,
    categoryFilters,
    setCategoryFilters,
    filteredSpells
  };
}
