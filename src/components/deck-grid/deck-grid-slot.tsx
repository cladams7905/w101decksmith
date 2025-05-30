import type { Spell } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus } from "lucide-react";
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
import { useState, useMemo, useCallback, memo, useRef } from "react";
import { useSpellsData } from "@/lib/hooks/use-spells-data";
import { SpellTierPopup } from "@/components/spell-sidebar/spell-tier-popup";
import { gridLogger } from "@/lib/logger";
import { SpellImage } from "./spell-image";

interface DeckGridSlotProps {
  spell: Spell | null;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isPopupOpen: boolean;
  onEmptySlotClick: (index: number, event: React.MouseEvent) => void;
  onFilledSlotClick: (index: number, event: React.MouseEvent) => void;
  onMouseDown: (index: number, event: React.MouseEvent) => void;
  onMouseEnter: (index: number) => void;
  onReplaceSpell?: (spellName: string, newSpell: Spell, index: number) => void;
  onDropSpell?: (spell: Spell, index: number) => void;
}

export const DeckGridSlot = memo(
  function DeckGridSlot({
    spell,
    index,
    isSelected,
    isDragging,
    isPopupOpen,
    onEmptySlotClick,
    onFilledSlotClick,
    onMouseDown,
    onMouseEnter,
    onReplaceSpell,
    onDropSpell
  }: DeckGridSlotProps) {
    const renderCount = useRef(0);
    renderCount.current += 1;

    const [isTierPopupOpen, setIsTierPopupOpen] = useState(false);
    const [currentSelectedSpell, setCurrentSelectedSpell] =
      useState<Spell | null>(null);
    const [isDragHovering, setIsDragHovering] = useState(false);

    const { spellCategories } = useSpellsData();

    // Memoize expensive computations with stable references
    const imageUrl = useMemo(
      () => (spell ? getSpellImageUrl(spell) : null),
      [spell]
    );

    // Stable spell image component that never changes during drag
    const stableSpellImage = useMemo(() => {
      if (!spell || !imageUrl) return null;
      return <SpellImage spell={spell} imageUrl={imageUrl} />;
    }, [spell, imageUrl]);

    const schoolColor = useMemo(
      () => (spell ? getSchoolColor(spell) : "gray"),
      [spell]
    );

    // Memoize spell group computation
    const spellGroup = useMemo((): Spell[] | undefined => {
      if (!spell) return undefined;

      // Find all spells with the same name across all categories
      const allSpells = spellCategories.flatMap((category) => category.spells);
      const groupedSpells = groupSpellsByName(allSpells);
      return groupedSpells.get(spell.name);
    }, [spell, spellCategories]);

    // Memoize CSS colors object
    const schoolColors = useMemo(() => {
      if (!spell) return null;

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

      return getSchoolCSSColor(schoolColor);
    }, [schoolColor, spell]);

    // Memoize base classes with stable dependency
    const baseClasses = useMemo(() => {
      let classes = `aspect-square w-full h-auto min-w-0 min-h-0 flex items-center justify-center transition-all duration-200 cursor-pointer`;

      if (isSelected) {
        classes += " ring-2 ring-blue-500 ring-offset-1";
      }

      if (isDragHovering) {
        if (spell) {
          // Filled slot being hovered - show replace intent
          classes += " ring-2 ring-yellow-500 ring-offset-1 bg-yellow-500/20";
        } else {
          // Empty slot being hovered - show add intent
          classes += " ring-2 ring-green-500 ring-offset-1 bg-green-500/20";
        }
      }

      return classes;
    }, [isSelected, isDragHovering, spell]);

    // Memoize stable callback functions
    const handleTierButtonClick = useCallback(() => {
      setCurrentSelectedSpell(spell);
      setIsTierPopupOpen(true);
    }, [spell]);

    const handleTierSelect = useCallback((selectedSpell: Spell) => {
      setCurrentSelectedSpell(selectedSpell);
    }, []);

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        // Only trigger click if not part of a drag selection and not currently dragging
        if (event.detail === 1 && !isDragging) {
          // Single click
          if (spell) {
            onFilledSlotClick(index, event);
          } else {
            onEmptySlotClick(index, event);
          }
        }
      },
      [spell, onFilledSlotClick, onEmptySlotClick, index, isDragging]
    );

    const handleMouseEnterSlot = useCallback(() => {
      onMouseEnter(index);
    }, [onMouseEnter, index]);

    const handleMouseDownSlot = useCallback(
      (e: React.MouseEvent) => {
        onMouseDown(index, e);
      },
      [onMouseDown, index]
    );

    // Drag and drop handlers
    const handleDragOver = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setIsDragHovering(true);
      },
      [setIsDragHovering]
    );

    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragHovering(true);
      },
      [setIsDragHovering]
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragHovering(false);
      },
      [setIsDragHovering]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragHovering(false);

        try {
          const spellData = e.dataTransfer.getData("application/json");
          if (spellData && onDropSpell) {
            const spell = JSON.parse(spellData) as Spell;
            onDropSpell(spell, index);
          }
        } catch (error) {
          console.error("Error parsing dropped spell data:", error);
        }
      },
      [index, onDropSpell, setIsDragHovering]
    );

    // Memoize the tooltip content to prevent recreation during drag
    const tooltipContent = useMemo(() => {
      if (!spell || !spellGroup || !schoolColors) return null;

      return (
        <SpellTooltip
          spell={spell}
          spellGroup={spellGroup}
          schoolColor={schoolColor}
          onTierButtonClick={handleTierButtonClick}
        />
      );
    }, [spell, spellGroup, schoolColors, schoolColor, handleTierButtonClick]);

    if (spell) {
      const cardElement = (
        <Card
          className={`${baseClasses} group py-0 p-1 rounded-lg overflow-hidden transition-colors duration-200`}
          onClick={handleClick}
          onMouseDown={handleMouseDownSlot}
          onMouseEnter={handleMouseEnterSlot}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
            {stableSpellImage}

            {/* Hover edit overlay - hidden during drag to prevent flicker */}
            {!isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Edit className="h-4 w-4 text-white" />
              </div>
            )}
          </CardContent>
        </Card>
      );

      return (
        <>
          {!isDragging && !isPopupOpen ? (
            <Tooltip>
              <TooltipTrigger asChild>{cardElement}</TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="p-0 border-0 rounded-xl"
              >
                {tooltipContent}
              </TooltipContent>
            </Tooltip>
          ) : (
            cardElement
          )}

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
        onMouseDown={handleMouseDownSlot}
        onMouseEnter={handleMouseEnterSlot}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ minWidth: 0, minHeight: 0 }}
      >
        <CardContent className="p-1 h-full w-full flex flex-col items-center justify-center text-center overflow-hidden">
          <Plus className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[8px] text-muted-foreground">•</div>
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Most important props for visual state
    const spellSame = prevProps.spell === nextProps.spell;
    const indexSame = prevProps.index === nextProps.index;
    const selectedSame = prevProps.isSelected === nextProps.isSelected;
    const draggingSame = prevProps.isDragging === nextProps.isDragging;
    const popupSame = prevProps.isPopupOpen === nextProps.isPopupOpen;

    // Core principle: Only rerender if something VISUALLY meaningful changed
    // that would actually affect the rendered output

    // If spell or index changed, always rerender (fundamental change)
    if (!spellSame || !indexSame) {
      return false; // Allow rerender
    }

    // If selection state changed, rerender (visual feedback needed)
    if (!selectedSame) {
      return false; // Allow rerender
    }

    // For isDragging or isPopupOpen changes, we need to be smart:
    // - These affect tooltips and hover overlays
    // - But we don't want mass rerenders when dragging/popup starts/stops

    // If dragging or popup state changed, only rerender if this slot actually needs different behavior
    if (!draggingSame || !popupSame) {
      // If this slot has a spell, it needs to rerender to hide/show tooltips and overlays
      if (nextProps.spell) {
        return false; // Allow rerender for filled slots
      }
      // Empty slots don't have tooltips/overlays, so dragging/popup state change doesn't matter
      return true; // Skip rerender for empty slots
    }

    // All props are the same, skip rerender
    return true;
  }
);
