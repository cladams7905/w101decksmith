"use client";

import { useState, useEffect, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { Spell } from "@/lib/types";
import SpellUtilityBadge from "@/components/spell-utility-badge";
import {
  getSpellPips,
  getSpellDescription,
  getSpellSchool,
  getSpellImageUrl,
  getSpellPipDisplay
} from "@/lib/spell-utils";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface SpellTooltipProps {
  spell: Spell;
  spellGroup?: Spell[]; // Optional: all tiers of this spell
  schoolColor: string;
  onTierButtonClick?: () => void; // Optional: callback when tier button is clicked
}

// Reusable SpellImage component with loading states
const SpellImage = memo(function SpellImage({
  spell,
  className
}: {
  spell: Spell;
  className?: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUrl = getSpellImageUrl(spell);

  // Preload image to track loading state
  useEffect(() => {
    if (imageUrl) {
      // Reset states
      setImageLoaded(false);
      setImageError(false);

      const img = new window.Image();

      // Add a timeout to catch cases where neither onload nor onerror fires
      const timeout = setTimeout(() => {
        setImageError(true);
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        setImageLoaded(true);
        setImageError(false);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        setImageLoaded(false);
        setImageError(true);
      };

      img.src = imageUrl;

      // Cleanup function
      return () => {
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
      };
    } else {
      // No image URL, reset states
      setImageLoaded(false);
      setImageError(false);
    }
  }, [imageUrl, spell.name, spell.tier]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading animation */}
      {!imageLoaded && !imageError && imageUrl && (
        <div className="absolute inset-0 gradient-special animate-pulse">
          <div
            className="absolute inset-0 gradient-special animate-shimmer"
            style={{
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite"
            }}
          />
        </div>
      )}

      {/* Image */}
      {imageLoaded && !imageError && imageUrl && (
        <Image
          src={imageUrl}
          alt={spell.name}
          width={127}
          height={195}
          className="w-full h-full object-cover rounded-lg"
        />
      )}

      {/* Fallback background when no image or error */}
      {(!imageLoaded || imageError || !imageUrl) &&
        !(!imageLoaded && !imageError && imageUrl) && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-2" />
              <span className="text-xs text-center px-4">No Image</span>
            </div>
          </div>
        )}

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
});

const SpellTooltip = memo(function SpellTooltip({
  spell,
  spellGroup,
  schoolColor,
  onTierButtonClick
}: SpellTooltipProps) {
  // Get spell properties using utility functions
  const description = getSpellDescription(spell);
  const school = getSpellSchool(spell);

  // Check if this spell has multiple tiers
  const hasMultipleTiers = spellGroup && spellGroup.length > 1;

  return (
    <Card className="overflow-hidden gradient pt-0 pb-0 max-w-[32rem]">
      <div className="flex h-full">
        {/* Left Column - Full Height Spell Card Image */}
        <div className="w-40 flex-shrink-0">
          <div className="w-full h-full bg-muted flex items-center justify-center border-r border-border relative">
            <SpellImage spell={spell} className="w-32 h-48" />
          </div>
        </div>

        {/* Right Column - Header and Content */}
        <div className="flex-1 flex flex-col">
          <CardHeader className="bg-blue-950/50 border-b border-border pb-3 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CardTitle className="text-lg font-bold truncate">
                  {spell.name}
                </CardTitle>
                {spell.wiki_url && (
                  <a
                    href={spell.wiki_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasMultipleTiers && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTierButtonClick?.();
                    }}
                  >
                    Tier {spell.tier}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                )}
                <Badge
                  variant="outline"
                  className={`bg-${schoolColor}-900 text-${schoolColor}-100 flex-shrink-0`}
                >
                  {getSpellPipDisplay(spell)}{" "}
                  {getSpellPips(spell) === 1 ? "pip" : "pips"}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-sm">
              {school.charAt(0).toUpperCase() + school.slice(1)} School
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 pb-4 flex-1">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="text-sm flex-1">{description}</div>
              <SpellUtilityBadge spell={spell} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Show basic spell info that we have */}
              <div className="flex flex-col">
                <span className="text-muted-foreground">Pip Cost</span>
                <span className="font-medium">{getSpellPipDisplay(spell)}</span>
              </div>

              {spell.accuracy && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-medium">{spell.accuracy}%</span>
                </div>
              )}

              {spell.pvp_level && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">PvP Level</span>
                  <span className="font-medium">{spell.pvp_level}</span>
                </div>
              )}

              {spell.tier && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Tier</span>
                  <span className="font-medium">{spell.tier}</span>
                </div>
              )}

              {spell.card_effects && spell.card_effects.length > 0 && (
                <div className="flex flex-col col-span-2">
                  <span className="text-muted-foreground mb-1">Effects</span>
                  <div className="flex flex-wrap gap-1">
                    {spell.card_effects.map((effect, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Commented out sections for attributes that need to be parsed/added later */}
            {/* 
            {damage ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground">Damage</span>
                <span className="font-medium">{damage}</span>
              </div>
            ) : null}

            {damageOverTime ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground">Damage Over Time</span>
                <span className="font-medium">{damageOverTime}</span>
              </div>
            ) : null}

            {healing ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground">Healing</span>
                <span className="font-medium">{healing}</span>
              </div>
            ) : null}

            {healingOverTime ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground">Healing Over Time</span>
                <span className="font-medium">{healingOverTime}</span>
              </div>
            ) : null}

            {buffPercentage ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground">Buff</span>
                <span className="font-medium">+{buffPercentage}%</span>
              </div>
            ) : null}

            {debuffPercentage ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground">Debuff</span>
                <span className="font-medium">-{debuffPercentage}%</span>
              </div>
            ) : null}

            {pipsGained ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground">Pips Gained</span>
                <span className="font-medium">{pipsGained}</span>
              </div>
            ) : null}
            */}
          </CardContent>
        </div>
      </div>

      {/* Commented out utility breakdown since the metrics return 0 for now */}
      {/* 
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
      */}
    </Card>
  );
});

export default SpellTooltip;
