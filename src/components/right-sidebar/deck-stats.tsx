"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Deck } from "@/db/database.types";
import { UtilityMetrics } from "@/lib/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { BarChart, ChevronDown } from "lucide-react";
import { useState } from "react";
import UtilityMeter from "@/components/shared/utility-meter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import DeckStatsDrawer from "@/components/right-sidebar/deck-stats-drawer";
import {
  getSpellPips,
  getSpellDamage,
  getSpellDamageOverTime,
  getSpellBuffPercentage,
  getSpellDebuffPercentage,
  getSpellHealing,
  getSpellHealingOverTime,
  getSpellPipsGained,
  isUtilitySpell
} from "@/lib/spell-utils";

interface DeckStatsProps {
  deck: Deck;
}

export default function DeckStats({ deck }: DeckStatsProps) {
  const [isUtilityOpen, setIsUtilityOpen] = useState(false);
  const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(false);

  // Calculate stats based on the deck
  const calculateDPP = () => {
    if (deck.spells.length === 0) return 0;
    const totalDamage = deck.spells.reduce(
      (sum, spell) => sum + getSpellDamage(spell),
      0
    );
    const totalPips = deck.spells.reduce(
      (sum, spell) => sum + getSpellPips(spell),
      0
    );
    return totalPips > 0 ? Math.round((totalDamage / totalPips) * 10) / 10 : 0;
  };

  const calculatePipCost = () => {
    if (deck.spells.length === 0) return 0;
    const totalPips = deck.spells.reduce(
      (sum, spell) => sum + getSpellPips(spell),
      0
    );
    const avgPipCost = totalPips / deck.spells.length;
    return Math.round(avgPipCost * 10) / 10;
  };

  const calculateUtility = () => {
    if (deck.spells.length === 0) return 0;
    // Use the isUtilitySpell function to determine utility spells
    return Math.min(
      80,
      Math.round(
        (deck.spells.filter((spell) => isUtilitySpell(spell)).length /
          deck.spells.length) *
          100
      )
    );
  };

  const calculateComboLevel = () => {
    if (deck.spells.length < 3) return 0;

    // Count spells by school to determine combo potential
    const schoolCounts: Record<string, number> = {};
    deck.spells.forEach((spell) => {
      const school = spell.school || "unknown";
      schoolCounts[school] = (schoolCounts[school] || 0) + 1;
    });

    // More spells from the same school = better combos
    const dominantSchool = Object.entries(schoolCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const dominantSchoolPercentage = dominantSchool
      ? (dominantSchool[1] / deck.spells.length) * 100
      : 0;

    return Math.round(dominantSchoolPercentage);
  };

  // Calculate detailed utility metrics
  const calculateUtilityMetrics = (): UtilityMetrics => {
    if (deck.spells.length === 0) {
      return {
        dpp: 0,
        dot: 0,
        buff: 0,
        debuff: 0,
        hpp: 0,
        hot: 0,
        pip: 0
      };
    }

    // Calculate damage per pip
    const totalDamage = deck.spells.reduce(
      (sum, spell) => sum + getSpellDamage(spell),
      0
    );
    const totalPips = deck.spells.reduce(
      (sum, spell) => sum + getSpellPips(spell),
      0
    );
    const dpp = totalPips > 0 ? totalDamage / totalPips : 0;

    // Calculate damage over time utility
    const totalDOT = deck.spells.reduce(
      (sum, spell) => sum + getSpellDamageOverTime(spell),
      0
    );
    const dotSpells = deck.spells.filter(
      (spell) => getSpellDamageOverTime(spell) > 0
    ).length;
    const dot = dotSpells > 0 ? totalDOT / dotSpells : 0;

    // Calculate buff utility
    const totalBuffs = deck.spells.reduce(
      (sum, spell) => sum + getSpellBuffPercentage(spell),
      0
    );
    const buffSpells = deck.spells.filter(
      (spell) => getSpellBuffPercentage(spell) > 0
    ).length;
    const buff = buffSpells > 0 ? totalBuffs / buffSpells : 0;

    // Calculate debuff utility
    const totalDebuffs = deck.spells.reduce(
      (sum, spell) => sum + getSpellDebuffPercentage(spell),
      0
    );
    const debuffSpells = deck.spells.filter(
      (spell) => getSpellDebuffPercentage(spell) > 0
    ).length;
    const debuff = debuffSpells > 0 ? totalDebuffs / debuffSpells : 0;

    // Calculate healing per pip
    const totalHealing = deck.spells.reduce(
      (sum, spell) => sum + getSpellHealing(spell),
      0
    );
    const healingPips = deck.spells
      .filter((spell) => getSpellHealing(spell) > 0)
      .reduce((sum, spell) => sum + getSpellPips(spell), 0);
    const hpp = healingPips > 0 ? totalHealing / healingPips : 0;

    // Calculate healing over time utility
    const totalHOT = deck.spells.reduce(
      (sum, spell) => sum + getSpellHealingOverTime(spell),
      0
    );
    const hotSpells = deck.spells.filter(
      (spell) => getSpellHealingOverTime(spell) > 0
    ).length;
    const hot = hotSpells > 0 ? totalHOT / hotSpells : 0;

    // Calculate pip utility
    const totalPipsGained = deck.spells.reduce(
      (sum, spell) => sum + getSpellPipsGained(spell),
      0
    );
    const pipSpells = deck.spells.filter(
      (spell) => getSpellPipsGained(spell) > 0
    ).length;
    const pip = pipSpells > 0 ? totalPipsGained / pipSpells : 0;

    return {
      dpp,
      dot,
      buff,
      debuff,
      hpp,
      hot,
      pip
    };
  };

  const dpp = calculateDPP();
  const pipCost = calculatePipCost();
  const utility = calculateUtility();
  const comboLevel = calculateComboLevel();
  const utilityMetrics = calculateUtilityMetrics();

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-between">
        <h2 className="text-xl font-bold">Deck Stats</h2>
        <Sheet open={isStatsDrawerOpen} onOpenChange={setIsStatsDrawerOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <BarChart className="h-4 w-4" />
              Advanced Stats
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[80vh] sm:h-[85vh] p-0 rounded-t-xl"
          >
            <SheetHeader className="px-6 pt-6 pb-2">
              <SheetTitle>Advanced Deck Statistics</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              <DeckStatsDrawer deck={deck} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="overflow-hidden gradient pt-0">
        <CardHeader className="bg-blue-950/50 border-b h-full items-end pb-2! pt-6 border-border">
          <CardTitle className="text-sm">DPP (Damage Per Pip)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{dpp}</div>
          <Progress value={Math.min(dpp * 10, 100)} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card className="overflow-hidden gradient pt-0">
        <CardHeader className="bg-blue-950/50 border-b h-full items-end pb-2! pt-6 border-border">
          <CardTitle className="text-sm">Pip Cost</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{pipCost || 0}</div>
          <Progress
            value={Math.max(0, 100 - pipCost * 20)}
            className="h-2 mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Lower is better
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden gradient pt-0">
        <CardHeader className="bg-blue-950/50 border-b h-full items-end pb-2! pt-6 border-border">
          <CardTitle className="text-sm">Utility</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{utility}%</div>
          <Progress value={utility} className="h-2 mt-2" />

          <Collapsible
            open={isUtilityOpen}
            onOpenChange={setIsUtilityOpen}
            className="mt-4"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              <span>Utility Breakdown</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isUtilityOpen ? "transform rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              {utilityMetrics.dpp > 0 && (
                <UtilityMeter
                  label="Damage Utility (DPP)"
                  value={utilityMetrics.dpp}
                  maxValue={150}
                  description="Average damage per pip spent"
                />
              )}

              {utilityMetrics.dot > 0 && (
                <UtilityMeter
                  label="Damage Over Time Utility"
                  value={utilityMetrics.dot}
                  maxValue={150}
                  description="Average damage over time per spell"
                />
              )}

              {utilityMetrics.buff > 0 && (
                <UtilityMeter
                  label="Buff Utility"
                  value={utilityMetrics.buff}
                  maxValue={100}
                  description="Average buff percentage per spell"
                />
              )}

              {utilityMetrics.debuff > 0 && (
                <UtilityMeter
                  label="Debuff Utility"
                  value={utilityMetrics.debuff}
                  maxValue={100}
                  description="Average debuff percentage per spell"
                />
              )}

              {utilityMetrics.hpp > 0 && (
                <UtilityMeter
                  label="Heal Utility (HPP)"
                  value={utilityMetrics.hpp}
                  maxValue={200}
                  description="Average healing per pip spent"
                />
              )}

              {utilityMetrics.hot > 0 && (
                <UtilityMeter
                  label="Heal Over Time Utility"
                  value={utilityMetrics.hot}
                  maxValue={150}
                  description="Average healing over time per spell"
                />
              )}

              {utilityMetrics.pip > 0 && (
                <UtilityMeter
                  label="Pip Utility"
                  value={utilityMetrics.pip}
                  maxValue={5}
                  description="Average pips gained per spell"
                />
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card className="overflow-hidden gradient pt-0">
        <CardHeader className="bg-blue-950/50 border-b h-full items-end pb-2! pt-6 border-border">
          <CardTitle className="text-sm">Combo Level</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{comboLevel}%</div>
          <Progress value={comboLevel} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card className="overflow-hidden gradient pt-0">
        <CardHeader className="bg-blue-950/50 border-b h-full items-end pb-2! pt-6 border-border">
          <CardTitle className="text-sm">Deck Size</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{deck.spells.length}/64</div>
          <Progress
            value={(deck.spells.length / 64) * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>
    </div>
  );
}
