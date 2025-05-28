import type { Spell } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus, ImageIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/shared/spell-tooltip";
import {
  getSpellImageUrl,
  getSchoolColor,
  groupSpellsByName
} from "@/lib/spell-utils";
import { useState, useEffect } from "react";
import { useSpellsData } from "@/lib/hooks/use-spells-data";
import { SpellTierPopup } from "@/components/spell-sidebar/spell-tier-popup";
import { gridLogger } from "@/lib/logger";

interface DeckGridSlotProps {
  spell: Spell | null;
  index: number;
  isSelected: boolean;
  onEmptySlotClick: (index: number, event: React.MouseEvent) => void;
  onFilledSlotClick: (index: number, event: React.MouseEvent) => void;
  onMouseDown: (index: number, event: React.MouseEvent) => void;
  onMouseEnter: (index: number) => void;
  onReplaceSpell?: (spellName: string, newSpell: Spell, index: number) => void;
}

export function DeckGridSlot({
  spell,
  index,
  isSelected,
  onEmptySlotClick,
  onFilledSlotClick,
  onMouseDown,
  onMouseEnter,
  onReplaceSpell
}: DeckGridSlotProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isTierPopupOpen, setIsTierPopupOpen] = useState(false);
  const [currentSelectedSpell, setCurrentSelectedSpell] =
    useState<Spell | null>(null);

  const { spellCategories } = useSpellsData();

  const imageUrl = spell ? getSpellImageUrl(spell) : null;
  const schoolColor = spell ? getSchoolColor(spell) : "gray";

  // Get spell group (all tiers) for the current spell
  const getSpellGroup = (): Spell[] | undefined => {
    if (!spell) return undefined;

    // Find all spells with the same name across all categories
    const allSpells = spellCategories.flatMap((category) => category.spells);
    const groupedSpells = groupSpellsByName(allSpells);
    return groupedSpells.get(spell.name);
  };

  const spellGroup = getSpellGroup();

  // Handle tier button click
  const handleTierButtonClick = () => {
    setCurrentSelectedSpell(spell); // Initialize with current spell
    setIsTierPopupOpen(true);
  };

  // Handle tier selection (just updates the selected spell, doesn't close popup)
  const handleTierSelect = (selectedSpell: Spell) => {
    setCurrentSelectedSpell(selectedSpell);
  };

  // Get CSS color values for the school
  const getSchoolCSSColor = (color: string) => {
    const colorMap: Record<
      string,
      { border: string; bg: string; hover: string }
    > = {
      red: {
        border: "rgb(239 68 68 / 0.6)",
        bg: "rgb(127 29 29 / 0.2)",
        hover: "rgb(248 113 113)"
      },
      blue: {
        border: "rgb(59 130 246 / 0.6)",
        bg: "rgb(30 58 138 / 0.2)",
        hover: "rgb(96 165 250)"
      },
      purple: {
        border: "rgb(147 51 234 / 0.6)",
        bg: "rgb(88 28 135 / 0.2)",
        hover: "rgb(168 85 247)"
      },
      green: {
        border: "rgb(34 197 94 / 0.6)",
        bg: "rgb(20 83 45 / 0.2)",
        hover: "rgb(74 222 128)"
      },
      gray: {
        border: "rgb(107 114 128 / 0.6)",
        bg: "rgb(55 65 81 / 0.2)",
        hover: "rgb(156 163 175)"
      },
      yellow: {
        border: "rgb(234 179 8 / 0.6)",
        bg: "rgb(133 77 14 / 0.2)",
        hover: "rgb(250 204 21)"
      },
      orange: {
        border: "rgb(249 115 22 / 0.6)",
        bg: "rgb(154 52 18 / 0.2)",
        hover: "rgb(251 146 60)"
      }
    };
    return colorMap[color] || colorMap.gray;
  };

  const schoolColors = spell ? getSchoolCSSColor(schoolColor) : null;

  // Preload image to track loading state
  useEffect(() => {
    if (imageUrl && spell) {
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
  }, [imageUrl, spell]);

  const handleClick = (event: React.MouseEvent) => {
    // Only trigger click if not part of a drag selection
    if (event.detail === 1) {
      // Single click
      if (spell) {
        onFilledSlotClick(index, event);
      } else {
        onEmptySlotClick(index, event);
      }
    }
  };

  const baseClasses = `aspect-square w-full h-auto min-w-0 min-h-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${
    isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
  }`;

  if (spell) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`${baseClasses} group py-0 p-1 rounded-lg overflow-hidden transition-colors duration-200`}
              onClick={handleClick}
              onMouseDown={(e) => onMouseDown(index, e)}
              onMouseEnter={() => onMouseEnter(index)}
              style={{
                minWidth: 0,
                minHeight: 0,
                borderWidth: "2px",
                borderColor: schoolColors?.border || "rgb(107 114 128 / 0.6)",
                backgroundColor: schoolColors?.bg || "rgb(55 65 81 / 0.2)"
              }}
              onMouseOver={(e) => {
                if (schoolColors) {
                  e.currentTarget.style.borderColor = schoolColors.hover;
                }
              }}
              onMouseOut={(e) => {
                if (schoolColors) {
                  e.currentTarget.style.borderColor = schoolColors.border;
                }
              }}
            >
              <CardContent className="p-0 h-full w-full relative overflow-hidden">
                {/* Spell Image */}
                {imageLoaded && !imageError && imageUrl && (
                  <div
                    className="absolute inset-0 w-full h-full flex items-center justify-center rounded-lg"
                    style={{
                      backgroundImage: `url("${imageUrl}")`,
                      backgroundSize: "175%",
                      backgroundPosition: "center 35%",
                      backgroundRepeat: "no-repeat"
                    }}
                  />
                )}

                {/* Fallback background when no image or error */}
                {(!imageLoaded || imageError || !imageUrl) &&
                  !(!imageLoaded && !imageError && imageUrl) && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[8px] text-center px-1 leading-tight">
                          {spell.name}
                        </span>
                      </div>
                    </div>
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

                {/* Hover edit overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Edit className="h-4 w-4 text-white" />
                </div>

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
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="p-0 border-0 rounded-xl"
          >
            <SpellTooltip
              spell={spell}
              spellGroup={spellGroup}
              schoolColor={schoolColor}
              onTierButtonClick={handleTierButtonClick}
            />
          </TooltipContent>
        </Tooltip>

        {/* Tier Selection Popup - Rendered outside tooltip */}
        {spellGroup && spellGroup.length > 1 && currentSelectedSpell && (
          <SpellTierPopup
            spellGroup={spellGroup}
            selectedSpell={currentSelectedSpell}
            onTierSelect={handleTierSelect}
            isOpen={isTierPopupOpen}
            onOpenChange={(open) => {
              if (!open && currentSelectedSpell && onReplaceSpell) {
                // When popup closes, apply the selected tier if it's different from original
                if (currentSelectedSpell.tier !== spell?.tier) {
                  // Store the spell to replace with before resetting state
                  const spellToReplaceWith = currentSelectedSpell;

                  gridLogger.debug("Replacing spell in grid slot:", {
                    index,
                    oldSpell: spell?.name,
                    oldTier: spell?.tier,
                    newSpell: spellToReplaceWith.name,
                    newTier: spellToReplaceWith.tier
                  });

                  // First do the replacement
                  if (spell && onReplaceSpell) {
                    onReplaceSpell(spell.name, spellToReplaceWith, index);
                  }

                  // Then reset states after a short delay
                  setTimeout(() => {
                    gridLogger.debug(
                      "Resetting states after spell replacement"
                    );
                    setCurrentSelectedSpell(null);
                    setIsTierPopupOpen(false);
                  }, 100);

                  return;
                }
              }
              setIsTierPopupOpen(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <Card
      className={`${baseClasses} border-blue-900/30 bg-linear-to-br from-blue-900/40 hover:bg-gray-600/30 hover:border-gray-400/50 group overflow-hidden py-0`}
      onClick={handleClick}
      onMouseDown={(e) => onMouseDown(index, e)}
      onMouseEnter={() => onMouseEnter(index)}
      style={{ minWidth: 0, minHeight: 0 }}
    >
      <CardContent className="p-1 h-full w-full flex flex-col items-center justify-center text-center overflow-hidden">
        <Plus className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-[8px] text-muted-foreground">•</div>
      </CardContent>
    </Card>
  );
}
