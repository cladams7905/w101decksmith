"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Spell } from "@/lib/types";
import { getSpellImageUrl } from "@/lib/spell-utils";
import Image from "next/image";

interface SpellTierPopupProps {
  spellGroup: Spell[];
  selectedSpell: Spell;
  onTierSelect: (spell: Spell) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to organize spells into branches
function organizeTierBranches(spells: Spell[]) {
  const branches: { [key: string]: Spell[] } = {};
  const baseTiers: Spell[] = [];

  spells.forEach((spell) => {
    const tier = spell.tier || "1";

    // Check if tier has a letter suffix (like 2a, 3b, etc.)
    const hasLetter = /[A-Za-z]/.test(tier);

    if (hasLetter) {
      // Extract the letter suffix (A, B, etc.)
      const letter = tier.match(/([A-Za-z])$/)?.[1]?.toUpperCase() || "A";
      const branchKey = letter;

      if (!branches[branchKey]) {
        branches[branchKey] = [];
      }
      branches[branchKey].push(spell);
    } else {
      // No letter suffix, so it's a base tier
      baseTiers.push(spell);
    }
  });

  // Sort spells within each branch by tier number
  Object.keys(branches).forEach((branchKey) => {
    branches[branchKey].sort((a, b) => {
      const tierA = parseInt((a.tier || "1").match(/^\d+/)?.[0] || "1");
      const tierB = parseInt((b.tier || "1").match(/^\d+/)?.[0] || "1");
      return tierA - tierB;
    });
  });

  // Sort base tiers
  baseTiers.sort((a, b) => {
    const tierA = parseInt((a.tier || "1").match(/^\d+/)?.[0] || "1");
    const tierB = parseInt((b.tier || "1").match(/^\d+/)?.[0] || "1");
    return tierA - tierB;
  });

  return { branches, baseTiers };
}

// Reusable SpellImage component with loading states
function SpellImage({
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
          className="w-full h-full object-cover"
        />
      )}

      {/* Fallback background when no image or error */}
      {(!imageLoaded || imageError || !imageUrl) &&
        !(!imageLoaded && !imageError && imageUrl) && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <span className="text-white text-xs">No Image</span>
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
}

export function SpellTierPopup({
  spellGroup,
  selectedSpell,
  onTierSelect,
  isOpen,
  onOpenChange
}: SpellTierPopupProps) {
  const handleTierSelect = (spell: Spell) => {
    onTierSelect(spell);
    // Don't close the popup - let user click "Select Tier" button to close
  };

  const handleFinalSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
  };

  const { branches, baseTiers } = organizeTierBranches(spellGroup);
  const branchKeys = Object.keys(branches).sort();
  const hasBranches = branchKeys.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
      <DialogOverlay
        className="bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      <DialogContent
        className="sm:max-w-5xl max-h-[80vh] overflow-y-auto pb-0"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-lg pr-8">
            Spell Tiers - {selectedSpell.name}
          </DialogTitle>
        </DialogHeader>

        {/* Tier Selection Interface - Show if there are branches OR multiple base tiers */}
        {(hasBranches || baseTiers.length > 1) && (
          <div
            className={`flex justify-center w-full h-fit ${
              hasBranches ? "mt-20" : "py-10"
            }`}
          >
            <div className="relative">
              {/* For branching spells: Base Tiers Column (Left side) */}
              {hasBranches && baseTiers.length > 0 && (
                <div className="absolute mt-12 left-0 top-0 flex flex-col items-center gap-8">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Base Tier
                  </div>
                  {baseTiers.map((spell) => (
                    <div key={spell.tier} className="relative">
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTierSelect(spell);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className={`relative group transition-all duration-200 cursor-pointer ${
                          spell.tier === selectedSpell.tier
                            ? "scale-110"
                            : "hover:scale-105"
                        }`}
                      >
                        {/* Spell Image */}
                        <div
                          className={`w-28 h-44 rounded-md overflow-hidden border-2 ${
                            spell.tier === selectedSpell.tier
                              ? "border-primary shadow-lg"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <SpellImage spell={spell} className="w-full h-full" />
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {`${spell.name} - ${spell.tier}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* For linear progressions: Horizontal tier progression */}
              {!hasBranches && baseTiers.length > 1 && (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Tier Progression
                  </div>
                  <div className="flex items-center gap-4">
                    {baseTiers.map((spell, index) => (
                      <div key={spell.tier} className="flex items-center">
                        {/* Tier Node */}
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTierSelect(spell);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className={`relative group transition-all duration-200 cursor-pointer ${
                            spell.tier === selectedSpell.tier
                              ? "scale-110"
                              : "hover:scale-105"
                          }`}
                        >
                          {/* Spell Image */}
                          <div
                            className={`w-28 h-44 rounded-md overflow-hidden border-2 ${
                              spell.tier === selectedSpell.tier
                                ? "border-primary shadow-lg"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <SpellImage
                              spell={spell}
                              className="w-full h-full"
                            />
                          </div>

                          {/* Tier Number Badge */}
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                            {spell.tier}
                          </div>

                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {`${spell.name} - ${spell.tier}`}
                          </div>
                        </div>

                        {/* Arrow to next tier */}
                        {index < baseTiers.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-muted-foreground mx-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Branch Rows (for branching spells) */}
              {hasBranches && (
                <div className="ml-52">
                  {branchKeys.map((branchKey, branchIndex) => (
                    <div
                      key={branchKey}
                      className="space-y-16 mb-12"
                      style={{
                        top: `${branchIndex * 160}px`,
                        transform: `translateY(-${
                          (branchKeys.length - 1) * 80
                        }px)`
                      }}
                    >
                      {/* Branch Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <Button
                          variant="outline_primary"
                          className="w-10 h-10 border-2 flex items-center justify-center"
                        >
                          <span className="text-white font-bold text-base">
                            {branchKey}
                          </span>
                        </Button>
                      </div>

                      {/* Tier Progression for this branch */}
                      <div className="flex items-center gap-4">
                        {branches[branchKey].map((spell, index) => (
                          <div key={spell.tier} className="flex items-center">
                            {/* Tier Node */}
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTierSelect(spell);
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className={`relative group transition-all duration-200 cursor-pointer ${
                                spell.tier === selectedSpell.tier
                                  ? "scale-110"
                                  : "hover:scale-105"
                              }`}
                            >
                              {/* Spell Image */}
                              <div
                                className={`w-28 h-44 rounded-md overflow-hidden border-2 ${
                                  spell.tier === selectedSpell.tier
                                    ? "border-primary shadow-lg"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <SpellImage
                                  spell={spell}
                                  className="w-full h-full"
                                />
                              </div>

                              {/* Tier Number Badge */}
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                                {spell.tier}
                              </div>

                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {`${spell.name} - ${spell.tier}`}
                              </div>
                            </div>

                            {/* Arrow to next tier in same branch */}
                            {index < branches[branchKey].length - 1 && (
                              <ArrowRight className="w-5 h-5 text-muted-foreground mx-3" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 py-4 border-t sticky bottom-0 bg-background">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-muted-foreground/20 hover:border-muted-foreground/40"
          >
            Cancel
          </Button>
          <Button
            onClick={handleFinalSelect}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Select Tier {selectedSpell.tier}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
