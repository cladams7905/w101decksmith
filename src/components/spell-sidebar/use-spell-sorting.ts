import { useState, useCallback, useMemo } from "react";
import type { Spell } from "@/db/database.types";
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

type SortOption = {
  by: "pips" | "utility" | "none";
  order: "asc" | "desc";
};

// Memoized utility type calculation
const getUtilityTypeMemo = (() => {
  const cache = new Map<string, number>();

  return (spell: Spell): number => {
    const cacheKey = `${spell.name}-${spell.tier}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    let result: number;
    if (getSpellDamage(spell) > 0) result = 1;
    else if (getSpellDamageOverTime(spell) > 0) result = 2;
    else if (getSpellBuffPercentage(spell) > 0) result = 3;
    else if (getSpellDebuffPercentage(spell) > 0) result = 4;
    else if (getSpellHealing(spell) > 0) result = 5;
    else if (getSpellHealingOverTime(spell) > 0) result = 6;
    else if (getSpellPipsGained(spell) > 0) result = 7;
    else result = 8;

    cache.set(cacheKey, result);
    return result;
  };
})();

export function useSpellSorting() {
  const [schoolSortOptions, setSchoolSortOptions] = useState<
    Record<string, SortOption>
  >({});

  const toggleSchoolSort = useCallback(
    (schoolId: string, by: "pips" | "utility" | "none") => {
      setSchoolSortOptions((prev) => {
        const currentSort = prev[schoolId] || { by: "pips", order: "asc" };
        const newOrder =
          currentSort.by === by && currentSort.order === "asc" ? "desc" : "asc";
        return {
          ...prev,
          [schoolId]: { by, order: newOrder }
        };
      });
    },
    []
  );

  // Memoized sorting function with caching
  const getSortedSpells = useCallback(
    (spells: Spell[], sortOption: SortOption | undefined) => {
      // Default to sorting by pips in ascending order if no sort option is provided
      const effectiveSortOption = sortOption || { by: "pips", order: "asc" };

      if (effectiveSortOption.by === "none") {
        return spells;
      }

      // Use a stable sort key for consistent ordering
      return [...spells].sort((a, b) => {
        let comparison = 0;

        if (effectiveSortOption.by === "pips") {
          const pipsA = getSpellPips(a);
          const pipsB = getSpellPips(b);
          comparison = pipsA - pipsB;
        } else if (effectiveSortOption.by === "utility") {
          const typeA = getUtilityTypeMemo(a);
          const typeB = getUtilityTypeMemo(b);
          comparison = typeA - typeB;
        }

        // Apply sort order
        if (effectiveSortOption.order === "desc") {
          comparison = -comparison;
        }

        // Stable sort fallback: use spell name for consistent ordering
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name);
        }

        return comparison;
      });
    },
    []
  );

  // Memoize the return object to prevent unnecessary recreations
  return useMemo(
    () => ({
      schoolSortOptions,
      toggleSchoolSort,
      getSortedSpells
    }),
    [schoolSortOptions, toggleSchoolSort, getSortedSpells]
  );
}
