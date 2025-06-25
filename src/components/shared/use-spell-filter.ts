"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Spell } from "@/db/database.types";
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

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useSpellFilter(): UseSpellFilterReturn {
  const { spellCategories, loading, error } = useSpellsData();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<
    Record<string, boolean>
  >({});

  // Debounce search query to reduce filtering frequency
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Memoize the filtering function to prevent recreation
  const filterSpells = useCallback(
    (
      categories: typeof spellCategories,
      filters: Record<string, boolean>,
      query: string
    ) => {
      const normalizedQuery = query.toLowerCase();

      return categories
        .filter((category) => filters[category.id])
        .map((category) => ({
          ...category,
          spells: category.spells.filter(
            (spell: Spell) =>
              spell.name.toLowerCase().includes(normalizedQuery) ||
              spell.description?.toLowerCase().includes(normalizedQuery)
          )
        }))
        .filter((category) => category.spells.length > 0);
    },
    []
  );

  // Initialize category filters when spell categories are loaded
  const initialFilters = useMemo(() => {
    if (spellCategories.length === 0) return {};

    return spellCategories.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }, [spellCategories]);

  // Update category filters when categories are loaded (only once)
  useEffect(() => {
    if (
      spellCategories.length > 0 &&
      Object.keys(categoryFilters).length === 0
    ) {
      setCategoryFilters(initialFilters);
    }
  }, [spellCategories, categoryFilters, initialFilters]);

  // Memoize filtered spells computation
  const filteredSpells = useMemo(() => {
    if (
      spellCategories.length === 0 ||
      Object.keys(categoryFilters).length === 0
    ) {
      return [];
    }

    return filterSpells(spellCategories, categoryFilters, debouncedSearchQuery);
  }, [spellCategories, categoryFilters, debouncedSearchQuery, filterSpells]);

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
