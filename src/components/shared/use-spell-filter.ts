import { useState, useCallback, useEffect, useMemo } from "react";
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

  // Memoize the filtered categories to avoid unnecessary filtering
  const filteredCategories = useMemo(() => {
    return spellCategories.filter((category) => categoryFilters[category.id]);
  }, [spellCategories, categoryFilters]);

  // Memoize the search term processing
  const searchTerms = useMemo(() => {
    const terms = searchQuery.toLowerCase().trim().split(/\s+/);
    return terms.filter((term) => term.length > 0);
  }, [searchQuery]);

  // Memoize the spell filtering function
  const filterSpell = useCallback(
    (spell: Spell): boolean => {
      if (searchTerms.length === 0) return true;

      const name = spell.name.toLowerCase();
      const description = spell.description?.toLowerCase() || "";

      return searchTerms.every(
        (term) => name.includes(term) || description.includes(term)
      );
    },
    [searchTerms]
  );

  // Memoize the final filtered spells
  const filteredSpells = useMemo(() => {
    return filteredCategories
      .map((category) => ({
        ...category,
        spells: category.spells.filter(filterSpell)
      }))
      .filter((category) => category.spells.length > 0);
  }, [filteredCategories, filterSpell]);

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
