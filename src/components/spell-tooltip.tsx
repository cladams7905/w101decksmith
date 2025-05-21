"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Spell } from "@/lib/types";
import UtilityMeter from "@/components/utility-meter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import SpellUtilityBadge from "@/components/spell-utility-badge";

interface SpellTooltipProps {
  spell: Spell;
  schoolColor: string;
}

export default function SpellTooltip({
  spell,
  schoolColor
}: SpellTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate utility metrics
  const dpp = spell.damage && spell.pips > 0 ? spell.damage / spell.pips : 0;
  const dot = spell.damageOverTime || 0;
  const dotPerPip =
    spell.damageOverTime && spell.pips > 0
      ? spell.damageOverTime / spell.pips
      : 0;
  const buff = spell.buffPercentage || 0;
  const debuff = spell.debuffPercentage || 0;
  const hpp = spell.healing && spell.pips > 0 ? spell.healing / spell.pips : 0;
  const hot = spell.healingOverTime || 0;
  const hotPerPip =
    spell.healingOverTime && spell.pips > 0
      ? spell.healingOverTime / spell.pips
      : 0;
  const pip = spell.pipsGained || 0;

  return (
    <Card className="overflow-hidden gradient pt-0">
      <CardHeader className="bg-blue-950/50 border-b h-full items-end pb-2! pt-6 border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">{spell.name}</CardTitle>
          <Badge
            variant="outline"
            className={`bg-${schoolColor}-900 text-${schoolColor}-100`}
          >
            {spell.pips} {spell.pips === 1 ? "pip" : "pips"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)} School
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="text-sm">{spell.description}</div>
          <SpellUtilityBadge spell={spell} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {spell.damage ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Damage</span>
              <span className="font-medium">{spell.damage}</span>
            </div>
          ) : null}

          {spell.damageOverTime ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Damage Over Time</span>
              <span className="font-medium">{spell.damageOverTime}</span>
            </div>
          ) : null}

          {spell.healing ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Healing</span>
              <span className="font-medium">{spell.healing}</span>
            </div>
          ) : null}

          {spell.healingOverTime ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Healing Over Time</span>
              <span className="font-medium">{spell.healingOverTime}</span>
            </div>
          ) : null}

          {spell.buffPercentage ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Buff</span>
              <span className="font-medium">+{spell.buffPercentage}%</span>
            </div>
          ) : null}

          {spell.debuffPercentage ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Debuff</span>
              <span className="font-medium">-{spell.debuffPercentage}%</span>
            </div>
          ) : null}

          {spell.pipsGained ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Pips Gained</span>
              <span className="font-medium">{spell.pipsGained}</span>
            </div>
          ) : null}

          <div className="flex flex-col">
            <span className="text-muted-foreground">Pip Cost</span>
            <span className="font-medium">{spell.pips}</span>
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span>Utility Breakdown</span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {dpp > 0 && (
              <UtilityMeter
                label="Damage Per Pip (DPP)"
                value={dpp}
                maxValue={150}
              />
            )}

            {dot > 0 && (
              <UtilityMeter
                label="Damage Over Time"
                value={dotPerPip}
                maxValue={100}
                description={`${dot} total over time`}
              />
            )}

            {buff > 0 && (
              <UtilityMeter label="Buff Utility" value={buff} maxValue={100} />
            )}

            {debuff > 0 && (
              <UtilityMeter
                label="Debuff Utility"
                value={debuff}
                maxValue={100}
              />
            )}

            {hpp > 0 && (
              <UtilityMeter
                label="Healing Per Pip (HPP)"
                value={hpp}
                maxValue={200}
              />
            )}

            {hot > 0 && (
              <UtilityMeter
                label="Healing Over Time"
                value={hotPerPip}
                maxValue={150}
                description={`${hot} total over time`}
              />
            )}

            {pip > 0 && (
              <UtilityMeter label="Pip Utility" value={pip} maxValue={5} />
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
