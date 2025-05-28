import { Badge } from "@/components/ui/badge";
import type { Spell } from "@/lib/types";
import {
  getSpellDamage,
  getSpellDamageOverTime,
  getSpellBuffPercentage,
  getSpellDebuffPercentage,
  getSpellHealing,
  getSpellHealingOverTime,
  getSpellPipsGained
} from "@/lib/spell-utils";

interface SpellUtilityBadgeProps {
  spell: Spell;
  size?: "sm" | "md" | "lg";
}

export default function SpellUtilityBadge({
  spell,
  size = "md"
}: SpellUtilityBadgeProps) {
  // Determine the primary utility type of the spell
  const getUtilityType = () => {
    if (getSpellDamage(spell) > 0) {
      return { type: "damage", label: "Damage", color: "red" };
    }
    if (getSpellDamageOverTime(spell) > 0) {
      return { type: "dot", label: "DoT", color: "orange" };
    }
    if (getSpellBuffPercentage(spell) > 0) {
      return { type: "buff", label: "Buff", color: "blue" };
    }
    if (getSpellDebuffPercentage(spell) > 0) {
      return { type: "debuff", label: "Debuff", color: "purple" };
    }
    if (getSpellHealing(spell) > 0) {
      return { type: "healing", label: "Heal", color: "green" };
    }
    if (getSpellHealingOverTime(spell) > 0) {
      return { type: "hot", label: "HoT", color: "green" };
    }
    if (getSpellPipsGained(spell) > 0) {
      return { type: "pip", label: "Pip", color: "yellow" };
    }
    return { type: "other", label: "Utility", color: "gray" };
  };

  const utility = getUtilityType();

  // Size classes
  const sizeClasses = {
    sm: "text-[10px] px-1 py-0.5",
    md: "text-xs px-1.5 py-0.5",
    lg: "text-sm px-2 py-1"
  };

  return (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} bg-${utility.color}-900/50 text-${utility.color}-100 border-${utility.color}-700/50`}
    >
      {utility.label}
    </Badge>
  );
}
