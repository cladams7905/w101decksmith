"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { updateDeckSpells } from "@/db/actions/decks";
import type { Spell } from "@/db/database.types";
import { uiLogger } from "@/lib/logger";

interface AutoSaveIndicatorProps {
  deckId: number;
  spells: Spell[];
  className?: string;
}

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

export function AutoSaveIndicator({
  deckId,
  spells,
  className
}: AutoSaveIndicatorProps) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spellsRef = useRef<Spell[]>(spells);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (deckId === 0) return; // Don't save default/temp deck

    setStatus("saving");

    try {
      // Save to database
      await updateDeckSpells(deckId, spells);

      setStatus("saved");
      uiLogger.info("Deck auto-saved successfully");

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (error) {
      setStatus("error");
      uiLogger.error("Error auto-saving deck:", error);

      // Reset to idle after 5 seconds on error
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    }
  }, [deckId, spells]);

  // Set up auto-save whenever spells change
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set up auto-save if spells actually changed
    const spellsChanged =
      JSON.stringify(spellsRef.current) !== JSON.stringify(spells);
    if (spellsChanged) {
      spellsRef.current = spells;

      // Set up auto-save after 3 seconds of inactivity
      timeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, 3000);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [spells, deckId, performAutoSave]);

  // Get appropriate icon and color based on status
  const getStatusDisplay = () => {
    switch (status) {
      case "saving":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Saving...",
          color: "text-blue-500"
        };
      case "saved":
        return {
          icon: <Check className="h-3 w-3" />,
          text: "Saved",
          color: "text-green-500"
        };
      case "error":
        return {
          icon: <X className="h-3 w-3" />,
          text: "Error",
          color: "text-red-500"
        };
      default:
        return {
          icon: null,
          text: "",
          color: "text-muted-foreground"
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div
      className={`flex items-center gap-1 text-xs ${statusDisplay.color} ${className}`}
    >
      {statusDisplay.icon}
      <span>{statusDisplay.text}</span>
    </div>
  );
}
