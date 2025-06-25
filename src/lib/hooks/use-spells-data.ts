"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getAllSpells } from "@/db/actions/spells";
import type { Spell } from "@/db/database.types";
import { SpellCategory } from "@/lib/types";

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

// Global cache to prevent duplicate fetches across components
let globalSpellsCache: Spell[] | null = null;
let globalFetchPromise: Promise<Spell[]> | null = null;
let globalCacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Memoized function to organize spells by school
const organizeSpellsBySchoolMemo = (() => {
  let lastSpells: Spell[] | null = null;
  let lastResult: SpellCategory[] | null = null;

  return (spells: Spell[]): SpellCategory[] => {
    // Return cached result if spells haven't changed (reference equality)
    if (lastSpells === spells && lastResult) {
      return lastResult;
    }

    const spellsBySchool: Record<string, Spell[]> = {};

    spells.forEach((spell) => {
      const school = spell.school || "balance";
      if (!spellsBySchool[school]) {
        spellsBySchool[school] = [];
      }
      spellsBySchool[school].push(spell);
    });

    const result = Object.entries(spellsBySchool).map(
      ([schoolId, schoolSpells]) => ({
        id: schoolId,
        name: schoolId.charAt(0).toUpperCase() + schoolId.slice(1),
        color: SCHOOL_COLORS[schoolId] || "gray",
        spells: schoolSpells
      })
    );

    lastSpells = spells;
    lastResult = result;
    return result;
  };
})();

// Optimized fetching with global cache
const fetchSpellsWithCache = async (): Promise<Spell[]> => {
  const now = Date.now();

  // Return cached data if still valid
  if (globalSpellsCache && now < globalCacheExpiry) {
    return globalSpellsCache;
  }

  // Return existing promise if already fetching
  if (globalFetchPromise) {
    return globalFetchPromise;
  }

  // Create new fetch promise
  globalFetchPromise = getAllSpells();

  try {
    const spells = await globalFetchPromise;
    globalSpellsCache = spells;
    globalCacheExpiry = now + CACHE_DURATION;
    return spells;
  } catch (error) {
    // Clear the promise on error so it can be retried
    globalFetchPromise = null;
    throw error;
  } finally {
    // Clear the promise after completion (success or failure)
    globalFetchPromise = null;
  }
};

interface UseSpellsDataReturn {
  spellCategories: SpellCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSpellsData(): UseSpellsDataReturn {
  const [spells, setSpells] = useState<Spell[]>(globalSpellsCache || []);
  const [loading, setLoading] = useState(!globalSpellsCache);
  const [error, setError] = useState<string | null>(null);

  // Memoize spell categories to prevent recalculation
  const spellCategories = useMemo(() => {
    if (spells.length === 0) return [];
    return organizeSpellsBySchoolMemo(spells);
  }, [spells]);

  const fetchSpells = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedSpells = await fetchSpellsWithCache();
      setSpells(fetchedSpells);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch spells");
      console.error("Error fetching spells:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If we have cached data, don't show loading state
    if (globalSpellsCache) {
      setSpells(globalSpellsCache);
      setLoading(false);
    } else {
      fetchSpells();
    }
  }, [fetchSpells]);

  return {
    spellCategories,
    loading,
    error,
    refetch: fetchSpells
  };
}
