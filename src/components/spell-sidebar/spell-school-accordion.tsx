import type { Spell } from "@/lib/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { SpellCard } from "./spell-card";
import { SpellSortButtons } from "./spell-sort-buttons";

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
  return (
    <AccordionItem value={category.id}>
      <div className="sticky top-0 z-5 bg-background">
        <AccordionTrigger className="py-2 px-3">
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
          {sortedSpells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={spell}
              schoolColor={category.color}
              onClick={onSpellClick}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
