import { useState } from "react";
import type { Spell } from "@/lib/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { SpellCard } from "./spell-card";
import { SpellSortButtons } from "./spell-sort-buttons";
import { groupSpellsByName, getPrimarySpell } from "@/lib/spell-utils";

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

export function SpellSchoolAccordion({
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

  // Group spells by name to consolidate different tiers
  const groupedSpells = groupSpellsByName(sortedSpells);

  // Get the spell to display for each group (either selected tier or primary)
  const getDisplaySpell = (spellName: string, spellGroup: Spell[]): Spell => {
    const selectedSpell = selectedTiers.get(spellName);
    return selectedSpell || getPrimarySpell(spellGroup);
  };

  // Handle tier selection
  const handleTierSelect = (spellName: string, selectedSpell: Spell) => {
    setSelectedTiers((prev) => {
      const newMap = new Map(prev);
      newMap.set(spellName, selectedSpell);
      return newMap;
    });
  };

  return (
    <AccordionItem value={category.id}>
      <div className="sticky top-0 z-20">
        <AccordionTrigger className="py-2 px-3 bg-background mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full bg-${category.color}-500`}
            ></div>
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
        <div className="grid grid-cols-2 gap-2 p-1">
          {Array.from(groupedSpells.entries()).map(
            ([spellName, spellGroup]) => {
              const displaySpell = getDisplaySpell(spellName, spellGroup);
              return (
                <SpellCard
                  key={spellName}
                  spell={displaySpell}
                  spellGroup={spellGroup}
                  schoolColor={category.color}
                  onClick={onSpellClick}
                  onTierSelect={(selectedSpell) =>
                    handleTierSelect(spellName, selectedSpell)
                  }
                />
              );
            }
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
