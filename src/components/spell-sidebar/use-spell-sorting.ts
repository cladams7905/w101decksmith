import { useState, useCallback } from "react";
import type { Spell } from "@/lib/types";
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

// Move utility calculation outside hook
const calculateSpellUtility = (spell: Spell): number => {
  const damage = getSpellDamage(spell) || 0;
  const dot = getSpellDamageOverTime(spell) || 0;
  const buff = getSpellBuffPercentage(spell) || 0;
  const debuff = getSpellDebuffPercentage(spell) || 0;
  const healing = getSpellHealing(spell) || 0;
  const hot = getSpellHealingOverTime(spell) || 0;
  const pipsGained = getSpellPipsGained(spell) || 0;

  // Weight different aspects of utility
  return (
    damage * 1 +
    dot * 0.8 +
    buff * 2 +
    debuff * 2 +
    healing * 1.2 +
    hot * 1 +
    pipsGained * 5
  );
};

// Cache utility values for spells
const utilityCache = new WeakMap<Spell, number>();
const getSpellUtility = (spell: Spell): number => {
  if (!utilityCache.has(spell)) {
    utilityCache.set(spell, calculateSpellUtility(spell));
  }
  return utilityCache.get(spell)!;
};

export function useSpellSorting() {
  const [schoolSortOptions, setSchoolSortOptions] = useState<
    Record<string, SortOption>
  >({});

  const toggleSchoolSort = useCallback(
    (schoolId: string, by: "pips" | "utility" | "none") => {
      setSchoolSortOptions((prev) => {
        const current = prev[schoolId];
        if (!current || current.by !== by) {
          return {
            ...prev,
            [schoolId]: { by, order: "asc" }
          };
        }
        return {
          ...prev,
          [schoolId]: {
            by,
            order: current.order === "asc" ? "desc" : "asc"
          }
        };
      });
    },
    []
  );

  const getSortedSpells = useCallback(
    (spells: Spell[], sortOption?: SortOption) => {
      if (!sortOption || sortOption.by === "none") {
        return spells;
      }

      // Memoize the sorted array using a stable sort
      return [...spells].sort((a, b) => {
        let aValue: number, bValue: number;

        if (sortOption.by === "pips") {
          aValue = getSpellPips(a);
          bValue = getSpellPips(b);
        } else {
          // Use cached utility values
          aValue = getSpellUtility(a);
          bValue = getSpellUtility(b);
        }

        const sortFactor = sortOption.order === "asc" ? 1 : -1;
        const comparison = (aValue - bValue) * sortFactor;

        // If values are equal, maintain stable sort by using spell name
        return comparison === 0 ? a.name.localeCompare(b.name) : comparison;
      });
    },
    []
  );

  return {
    schoolSortOptions,
    toggleSchoolSort,
    getSortedSpells
  };
}
