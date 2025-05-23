import type { Spell } from "@/lib/types";
import { Accordion } from "@/components/ui/accordion";
import { SpellSchoolAccordion } from "./spell-school-accordion";
import { useSpellSorting } from "../../lib/hooks/use-spell-sorting";

interface SpellListProps {
  filteredSpells: {
    id: string;
    name: string;
    color: string;
    spells: Spell[];
  }[];
  onSpellClick: (spell: Spell, event: React.MouseEvent) => void;
}

export function SpellList({ filteredSpells, onSpellClick }: SpellListProps) {
  const { schoolSortOptions, toggleSchoolSort, getSortedSpells } =
    useSpellSorting();

  return (
    <Accordion type="multiple" className="w-full">
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
        />
      ))}
    </Accordion>
  );
}
