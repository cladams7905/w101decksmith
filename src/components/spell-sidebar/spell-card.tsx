import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/spell-tooltip";
import { SpellTierPopup } from "./spell-tier-popup";
import type { Spell } from "@/lib/types";
import { getSpellPips, getSpellImageUrl } from "@/lib/spell-utils";

interface SpellCardProps {
  spell: Spell;
  spellGroup?: Spell[]; // Optional: all tiers of this spell
  schoolColor: string;
  onClick: (spell: Spell, event: React.MouseEvent) => void;
  onTierSelect?: (spell: Spell) => void; // Optional: callback when tier is selected
}

export function SpellCard({
  spell,
  spellGroup,
  schoolColor,
  onClick,
  onTierSelect
}: SpellCardProps) {
  const [isTierPopupOpen, setIsTierPopupOpen] = useState(false);
  const [currentSpell, setCurrentSpell] = useState(spell);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Sync currentSpell when spell prop changes
  useEffect(() => {
    setCurrentSpell(spell);
    // Reset image loading state when spell changes
    setImageLoaded(false);
    setImageError(false);
  }, [spell]);

  const handleTierButtonClick = () => {
    setIsTierPopupOpen(true);
  };

  const handleTierSelect = (selectedSpell: Spell) => {
    setCurrentSpell(selectedSpell);
    onTierSelect?.(selectedSpell);
    // Don't close the popup here - let the popup handle its own closing
  };

  const handleTierPopupClose = () => {
    setIsTierPopupOpen(false);
  };

  const imageUrl = getSpellImageUrl(currentSpell);

  // Preload image to track loading state
  useEffect(() => {
    if (imageUrl) {
      // Reset states
      setImageLoaded(false);
      setImageError(false);

      const img = new Image();

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
  }, [imageUrl, currentSpell.name, currentSpell.tier]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className="cursor-pointer hover:bg-accent hover:border-primary active:border-primary transition-all duration-200 spell-card relative overflow-hidden h-20 group pb-0"
            onClick={(e) => onClick(currentSpell, e)}
          >
            {/* Background Image as a div instead of CSS background */}
            {imageLoaded && !imageError && imageUrl && (
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url("${imageUrl}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 20%",
                  backgroundRepeat: "no-repeat"
                }}
              />
            )}

            {/* Fallback background color */}
            {(!imageLoaded || imageError || !imageUrl) && (
              <div className="absolute inset-0 z-0 bg-gray-800" />
            )}

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

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b via-black/10 to-black/80 group-hover:from-black/70 group-hover:via-black/50 group-hover:to-black/80 transition-all duration-200" />
            <CardContent className="p-2 relative z-10 h-full flex flex-col">
              <div className="mt-auto flex justify-between items-end gap-1">
                <div className="font-medium text-white text-sm truncate flex-1 drop-shadow-sm">
                  {currentSpell.name}
                </div>
                <Badge
                  variant="outline"
                  className={`bg-${schoolColor}-900 text-${schoolColor}-100 shrink-0 text-xs border-${schoolColor}-700`}
                >
                  {getSpellPips(currentSpell)}
                </Badge>
              </div>
            </CardContent>

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
              .animate-shimmer {
                animation: shimmer 1.5s infinite;
              }
            `}</style>
          </Card>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="p-0 border-0 rounded-xl"
        >
          <SpellTooltip
            spell={currentSpell}
            spellGroup={spellGroup}
            schoolColor={schoolColor}
            onTierButtonClick={handleTierButtonClick}
          />
        </TooltipContent>
      </Tooltip>

      {/* Tier Selection Modal - Rendered outside tooltip */}
      {spellGroup && spellGroup.length > 1 && (
        <SpellTierPopup
          spellGroup={spellGroup}
          selectedSpell={currentSpell}
          onTierSelect={handleTierSelect}
          isOpen={isTierPopupOpen}
          onOpenChange={handleTierPopupClose}
        />
      )}
    </>
  );
}
