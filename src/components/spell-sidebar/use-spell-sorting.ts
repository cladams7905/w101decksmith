import { useState } from "react";
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

export function useSpellSorting() {
  const [schoolSortOptions, setSchoolSortOptions] = useState<
    Record<string, SortOption>
  >({});

  const toggleSchoolSort = (
    schoolId: string,
    by: "pips" | "utility" | "none"
  ) => {
    setSchoolSortOptions((prev) => {
      const currentSort = prev[schoolId] || { by: "pips", order: "asc" };
      const newOrder =
        currentSort.by === by && currentSort.order === "asc" ? "desc" : "asc";
      return {
        ...prev,
        [schoolId]: { by, order: newOrder }
      };
    });
  };

  const getSortedSpells = (
    spells: Spell[],
    sortOption: SortOption | undefined
  ) => {
    // Default to sorting by pips in ascending order if no sort option is provided
    const effectiveSortOption = sortOption || { by: "pips", order: "asc" };

    if (effectiveSortOption.by === "none") {
      return spells;
    }

    return [...spells].sort((a, b) => {
      if (effectiveSortOption.by === "pips") {
        const pipsA = getSpellPips(a);
        const pipsB = getSpellPips(b);
        return effectiveSortOption.order === "asc"
          ? pipsA - pipsB
          : pipsB - pipsA;
      } else if (effectiveSortOption.by === "utility") {
        const getUtilityType = (spell: Spell): number => {
          if (getSpellDamage(spell) > 0) return 1;
          if (getSpellDamageOverTime(spell) > 0) return 2;
          if (getSpellBuffPercentage(spell) > 0) return 3;
          if (getSpellDebuffPercentage(spell) > 0) return 4;
          if (getSpellHealing(spell) > 0) return 5;
          if (getSpellHealingOverTime(spell) > 0) return 6;
          if (getSpellPipsGained(spell) > 0) return 7;
          return 8;
        };

        const typeA = getUtilityType(a);
        const typeB = getUtilityType(b);
        return effectiveSortOption.order === "asc"
          ? typeA - typeB
          : typeB - typeA;
      }
      return 0;
    });
  };

  return {
    schoolSortOptions,
    toggleSchoolSort,
    getSortedSpells
  };
}
