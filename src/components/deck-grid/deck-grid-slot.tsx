import type { Spell } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus, ImageIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/spell-tooltip";
import { getSpellImageUrl } from "@/lib/spell-utils";
import { useState, useEffect } from "react";

interface DeckGridSlotProps {
  spell: Spell | null;
  index: number;
  isSelected: boolean;
  onEmptySlotClick: (index: number, event: React.MouseEvent) => void;
  onFilledSlotClick: (index: number, event: React.MouseEvent) => void;
  onMouseDown: (index: number, event: React.MouseEvent) => void;
  onMouseEnter: (index: number) => void;
}

export function DeckGridSlot({
  spell,
  index,
  isSelected,
  onEmptySlotClick,
  onFilledSlotClick,
  onMouseDown,
  onMouseEnter
}: DeckGridSlotProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = spell ? getSpellImageUrl(spell) : null;

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

  const baseClasses = `aspect-square flex items-center justify-center transition-all duration-200 cursor-pointer ${
    isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
  }`;

  if (spell) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`${baseClasses} bg-purple-900/50 border-purple-700/50 hover:border-purple-500 group py-0 p-1 rounded-lg`}
            onClick={handleClick}
            onMouseDown={(e) => onMouseDown(index, e)}
            onMouseEnter={() => onMouseEnter(index)}
          >
            <CardContent className="p-0 h-full w-full relative">
              {/* Spell Image */}
              {imageLoaded && !imageError && imageUrl && (
                <div
                  className="z-0 w-full h-full flex items-center justify-center rounded-lg"
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
          <SpellTooltip spell={spell} schoolColor={spell.school || "gray"} />
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Card
      className={`${baseClasses} border-blue-900/30 bg-linear-to-br from-blue-900/40 hover:bg-gray-600/30 hover:border-gray-400/50 group`}
      onClick={handleClick}
      onMouseDown={(e) => onMouseDown(index, e)}
      onMouseEnter={() => onMouseEnter(index)}
    >
      <CardContent className="p-1 h-full w-full flex flex-col items-center justify-center text-center">
        <Plus className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-[8px] text-muted-foreground">•</div>
      </CardContent>
    </Card>
  );
}
