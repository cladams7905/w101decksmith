"use client";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import type { Deck, Spell } from "@/db/database.types";
import { useState } from "react";
import { getSchoolIconPath, getSpellPips } from "@/lib/spell-utils";
import Image from "next/image";

interface DeckBreakdownProps {
  deck: Deck;
}

export default function DeckBreakdown({ deck }: DeckBreakdownProps) {
  // Track which school categories are expanded
  const [expandedSchools, setExpandedSchools] = useState<
    Record<string, boolean>
  >({});

  // Toggle expanded state for a school
  const toggleSchoolExpanded = (school: string) => {
    setExpandedSchools((prev) => ({
      ...prev,
      [school]: !prev[school]
    }));
  };

  // Calculate the breakdown of spells by school
  const getSchoolBreakdown = () => {
    const breakdown: Record<string, number> = {};

    deck.spells.forEach((spell) => {
      const school = spell.school || "unknown";
      breakdown[school] = (breakdown[school] || 0) + 1;
    });

    // Sort by count (descending)
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([school, count]) => ({ school, count }));
  };

  // Get individual spell counts within each school
  const getSpellCounts = (school: string) => {
    const spellCounts: Record<string, { spell: Spell; count: number }> = {};

    deck.spells.forEach((spell) => {
      const spellSchool = spell.school || "unknown";
      if (spellSchool === school) {
        if (!spellCounts[spell.name]) {
          spellCounts[spell.name] = { spell, count: 0 };
        }
        spellCounts[spell.name].count += 1;
      }
    });

    // Sort by count (descending), then by pip cost (ascending)
    return Object.values(spellCounts).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return getSpellPips(a.spell) - getSpellPips(b.spell);
    });
  };

  const schoolBreakdown = getSchoolBreakdown();

  // Calculate the percentage of each school
  const calculatePercentage = (count: number) => {
    return deck.spells.length > 0
      ? Math.round((count / deck.spells.length) * 100)
      : 0;
  };

  return (
    <div className="py-2">
      <div className="px-3 py-1 font-medium text-sm">Deck Breakdown</div>
      <Separator className="my-1" />

      {deck.spells.length === 0 ? (
        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
          No spells in deck
        </div>
      ) : (
        <div className="space-y-1 py-1">
          {schoolBreakdown.map(({ school, count }) => (
            <Collapsible
              key={school}
              open={expandedSchools[school]}
              onOpenChange={() => toggleSchoolExpanded(school)}
              className="transition-all"
            >
              <div className="px-3 py-1.5 flex items-center justify-between group hover:bg-accent/50 transition-colors">
                <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      expandedSchools[school] ? "rotate-90" : ""
                    }`}
                  />
                  <Image
                    src={getSchoolIconPath(school)}
                    alt={school}
                    width={20}
                    height={20}
                    className="h-3 w-3"
                  />
                  <span className="text-sm capitalize">{school}</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {count} ({calculatePercentage(count)}%)
                  </Badge>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="pl-8 pr-3 space-y-1 py-1 border-l-2 border-blue-900/20 ml-3">
                  {getSpellCounts(school).map(({ spell, count }) => (
                    <div
                      key={spell.name}
                      className="flex items-center justify-between text-xs py-1 hover:bg-accent/30 px-2 rounded group/spell"
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]">
                          {spell.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="bg-blue-900/20 hover:bg-blue-900/30"
                        >
                          ×{count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          <Separator className="my-1" />

          <div className="px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Total</span>
              <Badge variant="outline" className="ml-1">
                {deck.spells.length} / 64
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              {64 - deck.spells.length} slots available
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
