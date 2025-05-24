import type { Spell } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/spell-tooltip";

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
  const [schoolSortOptions, setSchoolSortOptions] = useState<
    Record<string, { by: "pips" | "utility" | "none"; order: "asc" | "desc" }>
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

  const getSortedSchoolSpells = (category: { id: string; spells: Spell[] }) => {
    const sortOption = schoolSortOptions[category.id] || {
      by: "none",
      order: "asc"
    };

    if (sortOption.by === "none") {
      return category.spells;
    }

    return [...category.spells].sort((a, b) => {
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

  return (
    <div className="flex-1 overflow-auto">
      <Accordion type="multiple" className="w-full">
        {filteredSpells.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="py-2 px-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full bg-${category.color}-500`}
                ></div>
                <span>{category.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-2 px-3 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSchoolSort(category.id, "pips")}
                  className={
                    schoolSortOptions[category.id]?.by === "pips"
                      ? "bg-accent"
                      : ""
                  }
                >
                  Sort by Pips{" "}
                  {schoolSortOptions[category.id]?.by === "pips" &&
                    (schoolSortOptions[category.id]?.order === "asc"
                      ? "↑"
                      : "↓")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSchoolSort(category.id, "utility")}
                  className={
                    schoolSortOptions[category.id]?.by === "utility"
                      ? "bg-accent"
                      : ""
                  }
                >
                  Sort by Type{" "}
                  {schoolSortOptions[category.id]?.by === "utility" &&
                    (schoolSortOptions[category.id]?.order === "asc"
                      ? "↑"
                      : "↓")}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1">
                {getSortedSchoolSpells(category).map((spell) => (
                  <Tooltip key={spell.id}>
                    <TooltipTrigger asChild>
                      <Card
                        className="cursor-pointer hover:bg-accent hover:border-primary active:border-primary transition-colors spell-card"
                        onClick={(e) => onSpellClick(spell, e)}
                      >
                        <CardContent className="p-3 flex flex-col">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium truncate">
                              {spell.name}
                            </div>
                            <Badge
                              variant="outline"
                              className={`bg-${category.color}-900 text-${category.color}-100 ml-1 shrink-0`}
                            >
                              {spell.pips}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {spell.description}
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="start"
                      className="p-0 border-0 rounded-xl"
                    >
                      <SpellTooltip
                        spell={spell}
                        schoolColor={category.color}
                      />
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
