"use client";
import { Edit, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import type { Deck, Spell } from "@/lib/types";
import { useState, useRef } from "react";
import SpellSearchPopup from "@/components/deck-grid/spell-search-popup";
import { uiLogger } from "@/lib/logger";
import { getSpellPips } from "@/lib/spell-utils";

const POPUP_OFFSET = 260;

interface DeckBreakdownProps {
  deck: Deck;
  onReplaceSpells: (oldSpellId: string, newSpell: Spell) => void;
  onDeleteSpells: (spellId: string) => void;
}

export default function DeckBreakdown({
  deck,
  onReplaceSpells,
  onDeleteSpells
}: DeckBreakdownProps) {
  // Track which school categories are expanded
  const [expandedSchools, setExpandedSchools] = useState<
    Record<string, boolean>
  >({});

  // Popup state
  const [activeSpell, setActiveSpell] = useState<Spell | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [isReplacing, setIsReplacing] = useState(false);

  // Ref to the deck breakdown container
  const breakdownRef = useRef<HTMLDivElement>(null);

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

  // Get the color for a school
  const getSchoolColor = (school: string) => {
    const schoolColors: Record<string, string> = {
      fire: "red",
      ice: "blue",
      storm: "purple",
      life: "green",
      death: "gray",
      myth: "yellow",
      balance: "orange",
      astral: "purple",
      shadow: "gray"
    };
    return schoolColors[school] || "purple";
  };

  // Calculate the percentage of each school
  const calculatePercentage = (count: number) => {
    return deck.spells.length > 0
      ? Math.round((count / deck.spells.length) * 100)
      : 0;
  };

  // Handle edit spell click
  const handleEditSpell = (spell: Spell) => {
    uiLogger.info("Edit button clicked for spell:", spell.name);
    uiLogger.info(`Opening spell replacement popup for: ${spell.name}`);

    // Check if there's enough room on the right side for the popup
    const viewportWidth = window.innerWidth;
    const popupWidth = 254; // Width of the popup

    // Get the breakdown modal's position to calculate available space
    if (!breakdownRef.current) {
      uiLogger.error("Breakdown ref is null, using fallback position");
      const left = 0;
      const top = 0;
      setPopupPosition({ top, left });
      setActiveSpell(spell);
      setIsReplacing(true);
      return;
    }

    const breakdownRect = breakdownRef.current.getBoundingClientRect();
    const availableSpaceOnRight = viewportWidth - breakdownRect.right;

    uiLogger.info("Viewport width:", viewportWidth);
    uiLogger.info("Breakdown right edge:", breakdownRect.right);
    uiLogger.info("Available space on right:", availableSpaceOnRight);

    // If there's enough room for the popup on the right side, use POPUP_OFFSET, otherwise use left: 0
    const left = availableSpaceOnRight >= popupWidth ? POPUP_OFFSET : 0;
    const top = 0;

    uiLogger.info("Calculated position:", { left, top });
    uiLogger.info("Setting activeSpell:", spell);
    uiLogger.info("Setting isReplacing:", true);

    setPopupPosition({ top, left });
    setActiveSpell(spell);
    setIsReplacing(true);
  };

  // Handle delete spell click
  const handleDeleteSpell = (spell: Spell) => {
    uiLogger.info(`Deleting all instances of spell: ${spell.name}`);
    onDeleteSpells(spell.name);
  };

  // Handle spell selection from popup
  const handleSpellSelection = (newSpell: Spell, quantity: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = quantity; // Quantity is ignored for bulk replacement
    if (activeSpell) {
      uiLogger.info(
        `Replacing all instances of "${activeSpell.name}" with "${newSpell.name}"`
      );
      onReplaceSpells(activeSpell.name, newSpell);
    }
    closePopup();
  };

  // Handle delete from popup
  const handleDeleteFromPopup = () => {
    if (activeSpell) {
      uiLogger.info(
        `Deleting all instances of spell from popup: ${activeSpell.name}`
      );
      onDeleteSpells(activeSpell.name);
    }
    closePopup();
  };

  // Close popup
  const closePopup = () => {
    setActiveSpell(null);
    setIsReplacing(false);
  };

  return (
    <div className="py-2" ref={breakdownRef}>
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
                  <div
                    className={`w-3 h-3 rounded-full ${
                      school === "shadow"
                        ? "bg-gray-900"
                        : `bg-${getSchoolColor(school)}-500`
                    }`}
                    aria-hidden="true"
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
                        <div className="flex items-center opacity-0 group-hover/spell:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSpell(spell);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSpell(spell);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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

      {/* Spell Search Popup */}
      {activeSpell && (
        <SpellSearchPopup
          position={popupPosition}
          onClose={closePopup}
          onSelectSpell={handleSpellSelection}
          availableSlots={64 - deck.spells.length}
          isReplacing={isReplacing}
          onDeleteSelected={handleDeleteFromPopup}
        />
      )}
    </div>
  );
}
