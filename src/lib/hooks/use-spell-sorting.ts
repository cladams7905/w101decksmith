import { useState } from "react";
import type { Spell } from "@/lib/types";

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
      const currentSort = prev[schoolId] || { by: "none", order: "asc" };
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
    if (!sortOption || sortOption.by === "none") {
      return spells;
    }

    return [...spells].sort((a, b) => {
      if (sortOption.by === "pips") {
        return sortOption.order === "asc" ? a.pips - b.pips : b.pips - a.pips;
      } else if (sortOption.by === "utility") {
        const getUtilityType = (spell: Spell): number => {
          if (spell.damage && spell.damage > 0) return 1;
          if (spell.damageOverTime && spell.damageOverTime > 0) return 2;
          if (spell.buffPercentage && spell.buffPercentage > 0) return 3;
          if (spell.debuffPercentage && spell.debuffPercentage > 0) return 4;
          if (spell.healing && spell.healing > 0) return 5;
          if (spell.healingOverTime && spell.healingOverTime > 0) return 6;
          if (spell.pipsGained && spell.pipsGained > 0) return 7;
          return 8;
        };

        const typeA = getUtilityType(a);
        const typeB = getUtilityType(b);
        return sortOption.order === "asc" ? typeA - typeB : typeB - typeA;
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
