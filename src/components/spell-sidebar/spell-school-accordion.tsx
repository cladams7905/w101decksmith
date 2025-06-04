import { useState, useMemo, useCallback, memo } from "react";
import type { Spell } from "@/db/database.types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { SpellCard } from "./spell-card";
import { SpellSortButtons } from "./spell-sort-buttons";
import {
  groupSpellsByName,
  getPrimarySpell,
  getSchoolIconPath
} from "@/lib/spell-utils";
import Image from "next/image";

interface SpellSchoolAccordionProps {
  category: {
    id: string;
    name: string;
    color: string;
    spells: Spell[];
  };
  sortOptions:
    | {
        by: "pips" | "utility" | "none";
        order: "asc" | "desc";
      }
    | undefined;
  onSort: (schoolId: string, by: "pips" | "utility" | "none") => void;
  onSpellClick: (spell: Spell, event: React.MouseEvent) => void;
  sortedSpells: Spell[];
}

export const SpellSchoolAccordion = memo(function SpellSchoolAccordion({
  category,
  sortOptions,
  onSort,
  onSpellClick,
  sortedSpells
}: SpellSchoolAccordionProps) {
  // State to track selected tier for each spell group
  const [selectedTiers, setSelectedTiers] = useState<Map<string, Spell>>(
    new Map()
  );

  // Memoize spell grouping - expensive operation
  const groupedSpells = useMemo(() => {
    return groupSpellsByName(sortedSpells);
  }, [sortedSpells]);

  // Memoize the display spell getter function
  const getDisplaySpell = useCallback(
    (spellName: string, spellGroup: Spell[]): Spell => {
      const selectedSpell = selectedTiers.get(spellName);
      return selectedSpell || getPrimarySpell(spellGroup);
    },
    [selectedTiers]
  );

  // Memoize tier selection handler
  const handleTierSelect = useCallback(
    (spellName: string, selectedSpell: Spell) => {
      setSelectedTiers((prev) => {
        const newMap = new Map(prev);
        newMap.set(spellName, selectedSpell);
        return newMap;
      });
    },
    []
  );

  // Memoize school icon path
  const schoolIconPath = useMemo(
    () => getSchoolIconPath(category.id),
    [category.id]
  );

  // Memoize the spell cards to prevent recreation on every render
  const spellCards = useMemo(() => {
    return Array.from(groupedSpells.entries()).map(
      ([spellName, spellGroup]) => {
        const displaySpell = getDisplaySpell(spellName, spellGroup);
        return (
          <SpellCard
            key={spellName}
            spell={displaySpell}
            spellGroup={spellGroup}
            schoolColor={category.color}
            onClick={(spell) => onSpellClick(spell, {} as React.MouseEvent)}
            onTierSelect={(selectedSpell) =>
              handleTierSelect(spellName, selectedSpell)
            }
          />
        );
      }
    );
  }, [
    groupedSpells,
    getDisplaySpell,
    category.color,
    onSpellClick,
    handleTierSelect
  ]);

  return (
    <AccordionItem value={category.id} className="border-b-0">
      <div className="sticky top-0 z-20 bg-background pr-3 pl-2">
        <AccordionTrigger className="py-2 px-3 mb-2 bg-linear-to-br from-blue-900/40 border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <Image
              src={schoolIconPath}
              alt={category.name}
              width={20}
              height={20}
            />
            <span>{category.name}</span>
          </div>
        </AccordionTrigger>
      </div>
      <AccordionContent>
        <SpellSortButtons
          schoolId={category.id}
          sortOptions={sortOptions}
          onSort={onSort}
        />
        <div className="grid grid-cols-2 gap-2 p-1">{spellCards}</div>
      </AccordionContent>
    </AccordionItem>
  );
});
