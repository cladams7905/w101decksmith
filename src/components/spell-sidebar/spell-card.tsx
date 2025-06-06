import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/shared/spell-tooltip";
import { SpellTierPopup } from "./spell-tier-popup";
import type { Spell } from "@/db/database.types";
import { getSpellImageUrl, getSpellPipDisplay } from "@/lib/spell-utils";

interface SpellCardProps {
  spell: Spell;
  spellGroup?: Spell[]; // Optional: all tiers of this spell
  schoolColor: string;
  onClick: (spell: Spell) => void;
  onTierSelect?: (spell: Spell) => void; // Optional: callback when tier is selected
}

export const SpellCard = memo(function SpellCard({
  spell,
  spellGroup,
  schoolColor,
  onClick,
  onTierSelect
}: SpellCardProps) {
  // const [isTierPopupOpen, setIsTierPopupOpen] = useState(false);
  const [isTierPopupOpen, setIsTierPopupOpen] = useState(false);
  const [currentSpell, setCurrentSpell] = useState(spell);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number | null>(null);

  // Sync currentSpell when spell prop changes
  useEffect(() => {
    setCurrentSpell(spell);
    // Reset image loading state when spell changes
    setImageLoaded(false);
    setImageError(false);
  }, [spell]);

  // Memoize callbacks
  const handleTierSelect = useCallback(
    (selectedSpell: Spell) => {
      setCurrentSpell(selectedSpell);
      onTierSelect?.(selectedSpell);
      // Don't close the popup here - let the popup handle its own closing
    },
    [onTierSelect]
  );

  const handleTierButtonClick = useCallback(() => {
    setIsTierPopupOpen(true);
  }, []);

  // const handleTierPopupClose = useCallback(() => {
  //   setIsTierPopupOpen(false);
  // }, []);

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent click if we just finished dragging
      if (isDragging) {
        e.preventDefault();
        return;
      }

      // Additional check: if drag ended very recently, prevent click
      if (dragStartTime && Date.now() - dragStartTime < 200) {
        e.preventDefault();
        return;
      }

      onClick(currentSpell);
    },
    [onClick, currentSpell, isDragging, dragStartTime]
  );

  // Add drag and drop handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      const startTime = Date.now();
      setIsDragging(true);
      setDragStartTime(startTime);

      // Store the spell data in the drag event
      e.dataTransfer.setData("application/json", JSON.stringify(currentSpell));
      e.dataTransfer.effectAllowed = "copy";

      // Set a visual feedback for dragging
      e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 50, 10);
    },
    [currentSpell]
  );

  const handleDragEnd = useCallback(() => {
    // Reset dragging state immediately
    setIsDragging(false);
    setDragStartTime(null);
  }, []);

  // Memoize expensive computations
  const imageUrl = useMemo(
    () => getSpellImageUrl(currentSpell),
    [currentSpell]
  );

  const pipDisplay = useMemo(
    () => getSpellPipDisplay(currentSpell),
    [currentSpell]
  );

  // Memoize CSS colors object
  const schoolColors = useMemo(() => {
    const getSchoolCSSColor = (color: string) => {
      const colorMap: Record<
        string,
        { border: string; bg: string; hover: string; active: string }
      > = {
        red: {
          border: "rgb(239 68 68 / 0.6)",
          bg: "rgb(127 29 29 / 0.1)",
          hover: "rgb(248 113 113)",
          active: "rgb(252 165 165)"
        },
        blue: {
          border: "rgb(59 130 246 / 0.6)",
          bg: "rgb(30 58 138 / 0.1)",
          hover: "rgb(96 165 250)",
          active: "rgb(147 197 253)"
        },
        purple: {
          border: "rgb(147 51 234 / 0.6)",
          bg: "rgb(88 28 135 / 0.1)",
          hover: "rgb(168 85 247)",
          active: "rgb(196 181 253)"
        },
        green: {
          border: "rgb(34 197 94 / 0.6)",
          bg: "rgb(20 83 45 / 0.1)",
          hover: "rgb(74 222 128)",
          active: "rgb(134 239 172)"
        },
        gray: {
          border: "rgb(107 114 128 / 0.6)",
          bg: "rgb(55 65 81 / 0.1)",
          hover: "rgb(156 163 175)",
          active: "rgb(209 213 219)"
        },
        yellow: {
          border: "rgb(234 179 8 / 0.6)",
          bg: "rgb(133 77 14 / 0.1)",
          hover: "rgb(250 204 21)",
          active: "rgb(254 240 138)"
        },
        orange: {
          border: "rgb(249 115 22 / 0.6)",
          bg: "rgb(154 52 18 / 0.1)",
          hover: "rgb(251 146 60)",
          active: "rgb(253 186 116)"
        }
      };
      return colorMap[color] || colorMap.gray;
    };

    return getSchoolCSSColor(schoolColor);
  }, [schoolColor]);

  // Memoize mouse event handlers
  // const handleMouseOver = useCallback(
  //   (e: React.MouseEvent) => {
  //     (e.currentTarget as HTMLElement).style.borderColor = schoolColors.hover;
  //   },
  //   [schoolColors.hover]
  // );

  // const handleMouseOut = useCallback(
  //   (e: React.MouseEvent) => {
  //     (e.currentTarget as HTMLElement).style.borderColor = schoolColors.border;
  //   },
  //   [schoolColors.border]
  // );

  // const handleMouseDown = useCallback(
  //   (e: React.MouseEvent) => {
  //     (e.currentTarget as HTMLElement).style.borderColor = schoolColors.active;
  //   },
  //   [schoolColors.active]
  // );

  // const handleMouseUp = useCallback(
  //   (e: React.MouseEvent) => {
  //     (e.currentTarget as HTMLElement).style.borderColor = schoolColors.hover;
  //   },
  //   [schoolColors.hover]
  // );

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
            className="cursor-pointer hover:bg-accent transition-all duration-200 spell-card relative overflow-hidden h-20 group pb-0"
            style={{
              borderWidth: "2px",
              borderColor: schoolColors.border,
              backgroundColor: schoolColors.bg
            }}
            draggable={true}
            onClick={handleCardClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            // onMouseOver={handleMouseOver}
            // onMouseOut={handleMouseOut}
            // onMouseDown={handleMouseDown}
            // onMouseUp={handleMouseUp}
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
            <div className="absolute inset-0 bg-gradient-to-b via-black/20 to-black/90 group-hover:from-black/70 group-hover:via-black/50 group-hover:to-black/80 transition-all duration-200" />
            <CardContent className="p-2 relative z-10 h-full flex flex-col">
              <div className="mt-auto flex justify-between items-end gap-1">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate flex-1 drop-shadow-sm">
                    {currentSpell.name}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 text-xs bg-background"
                  style={{
                    borderColor: schoolColors.border,
                    color: "white"
                  }}
                >
                  {pipDisplay}
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
          onOpenChange={setIsTierPopupOpen}
        />
      )}
    </>
  );
});
