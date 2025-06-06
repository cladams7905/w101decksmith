"use client";

import { useState, useEffect, memo, useRef } from "react";
import { ImageIcon } from "lucide-react";
import type { Spell } from "@/db/database.types";

interface SpellImageProps {
  spell: Spell;
  imageUrl: string | null;
}

export const SpellImage = memo(
  function SpellImage({ spell, imageUrl }: SpellImageProps) {
    const renderCount = useRef(0);
    renderCount.current += 1;

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Simple image loading effect - no complex optimization
    useEffect(() => {
      if (!imageUrl) {
        setImageLoaded(false);
        setImageError(false);
        return;
      }

      // Reset states when imageUrl changes
      setImageLoaded(false);
      setImageError(false);

      const img = new Image();

      img.onload = () => {
        setImageLoaded(true);
        setImageError(false);
      };

      img.onerror = () => {
        setImageLoaded(false);
        setImageError(true);
      };

      img.src = imageUrl;

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [imageUrl, spell.name]); // Only depend on imageUrl, not spell

    // Show loaded image
    if (imageLoaded && !imageError && imageUrl) {
      return (
        <div
          className="absolute inset-0 w-full h-full rounded-lg"
          style={{
            backgroundImage: `url("${imageUrl}")`,
            backgroundSize: "175%",
            backgroundPosition: "center 35%",
            backgroundRepeat: "no-repeat"
          }}
        />
      );
    }

    // Show loading state
    if (!imageLoaded && !imageError && imageUrl) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 animate-pulse rounded-lg" />
      );
    }

    // Show error/fallback state
    return (
      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="w-6 h-6 mb-1" />
          <span className="text-[8px] text-center px-1 leading-tight">
            {spell.name}
          </span>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    const spellNameSame = prevProps.spell.name === nextProps.spell.name;
    const spellTierSame = prevProps.spell.tier === nextProps.spell.tier;
    const imageUrlSame = prevProps.imageUrl === nextProps.imageUrl;

    const shouldSkip = spellNameSame && spellTierSame && imageUrlSame;

    return shouldSkip;
  }
);
