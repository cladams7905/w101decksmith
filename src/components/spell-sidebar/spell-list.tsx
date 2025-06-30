import { memo, useState } from "react";
import type { Spell } from "@/db/database.types";
import { Accordion } from "@/components/ui/accordion";
import { SpellSchoolAccordion } from "./spell-school-accordion";
import { useSpellSorting } from "./use-spell-sorting";

interface SpellListProps {
  filteredSpells: {
    id: string;
    name: string;
    color: string;
    spells: Spell[];
  }[];
  onSpellClick: (spell: Spell) => void;
}

export const SpellList = memo(function SpellList({
  filteredSpells,
  onSpellClick
}: SpellListProps) {
  const { schoolSortOptions, toggleSchoolSort, getSortedSpells } =
    useSpellSorting();

  // Track which accordions are open
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const handleAccordionChange = (value: string[]) => {
    setOpenAccordions(value);
  };

  return (
    <Accordion
      type="multiple"
      className="w-full"
      value={openAccordions}
      onValueChange={handleAccordionChange}
    >
      {filteredSpells.map((category) => (
        <SpellSchoolAccordion
          key={category.id}
          category={category}
          sortOptions={schoolSortOptions[category.id]}
          onSort={toggleSchoolSort}
          onSpellClick={onSpellClick}
          sortedSpells={getSortedSpells(
            category.spells,
            schoolSortOptions[category.id]
          )}
          isOpen={openAccordions.includes(category.id)}
        />
      ))}
    </Accordion>
  );
});
