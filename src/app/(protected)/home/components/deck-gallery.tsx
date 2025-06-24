"use client";

import React, { useEffect, useState } from "react";
import { DeckCard } from "./deck-card";
import { DeckListItem } from "./deck-list-item";
import { DeckFilters } from "./deck-filters";
import { getDecksByUserId } from "@/db/actions/decks";
import { supabase } from "@/db/supabase/client";
import type { Deck } from "@/db/database.types";

interface DeckGalleryProps {
  selectedFilter: string;
}

export function DeckGallery({ selectedFilter }: DeckGalleryProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    type: "all",
    school: "all",
    level: "all",
    sortBy: "recent"
  });

  useEffect(() => {
    async function fetchUserDecks() {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          setError("User not authenticated");
          return;
        }

        const userDecks = await getDecksByUserId(user.id);
        setDecks(userDecks);
      } catch (err) {
        console.error("Error fetching user decks:", err);
        setError("Failed to load decks");
      } finally {
        setLoading(false);
      }
    }

    fetchUserDecks();
  }, []);

  // Filter and sort decks based on selected filter and additional filters
  const filteredDecks = React.useMemo(() => {
    let filtered = decks;

    // Filter by sidebar selection
    switch (selectedFilter) {
      case "my-decks":
        filtered = decks;
        break;
      case "favorites":
        // TODO: Implement favorites filtering when favorites feature is added
        filtered = decks.filter((deck) => deck.is_public); // Placeholder logic
        break;
      case "shared-with-me":
        // TODO: Implement shared decks filtering when sharing feature is added
        filtered = decks.filter((deck) => deck.can_comment); // Placeholder logic
        break;
      default:
        filtered = decks;
    }

    // Apply additional filters
    if (filters.type !== "all") {
      filtered = filtered.filter((deck) =>
        filters.type === "pve" ? deck.is_pve : !deck.is_pve
      );
    }

    if (filters.school !== "all") {
      filtered = filtered.filter((deck) => deck.school === filters.school);
    }

    if (filters.level !== "all") {
      const [min, max] = filters.level.includes("-")
        ? filters.level.split("-").map(Number)
        : filters.level === "150+"
        ? [150, Infinity]
        : [Number(filters.level), Number(filters.level)];

      filtered = filtered.filter(
        (deck) =>
          deck.level >= min && (max === Infinity ? true : deck.level <= max)
      );
    }

    // Sort the filtered results
    switch (filters.sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "level":
        filtered.sort((a, b) => b.level - a.level);
        break;
      case "school":
        filtered.sort((a, b) => a.school.localeCompare(b.school));
        break;
      case "views":
      case "likes":
        // Random sort for demo since we don't have real stats
        filtered.sort(() => Math.random() - 0.5);
        break;
      case "recent":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return filtered;
  }, [decks, selectedFilter, filters]);

  const getFilterTitle = () => {
    switch (selectedFilter) {
      case "my-decks":
        return "My Decks";
      case "favorites":
        return "Favorite Decks";
      case "shared-with-me":
        return "Decks Shared with Me";
      default:
        return "My Decks";
    }
  };

  const getFilterDescription = () => {
    switch (selectedFilter) {
      case "my-decks":
        return `${filteredDecks.length} deck${
          filteredDecks.length !== 1 ? "s" : ""
        } in your collection`;
      case "favorites":
        return `${filteredDecks.length} favorite deck${
          filteredDecks.length !== 1 ? "s" : ""
        }`;
      case "shared-with-me":
        return `${filteredDecks.length} deck${
          filteredDecks.length !== 1 ? "s" : ""
        } shared with you`;
      default:
        return `${filteredDecks.length} deck${
          filteredDecks.length !== 1 ? "s" : ""
        }`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Loading your decks...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredDecks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            {selectedFilter === "my-decks"
              ? "No decks found"
              : `No ${selectedFilter.replace("-", " ")} found`}
          </h2>
          <p className="text-muted-foreground mt-2">
            {selectedFilter === "my-decks"
              ? "Create your first deck to get started!"
              : "No decks match this filter yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filter Bar */}
      <DeckFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{getFilterTitle()}</h1>
            <p className="text-muted-foreground mt-2">
              {getFilterDescription()}
            </p>
          </div>

          {/* Grid or List View */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDecks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} />
              ))}
            </div>
          ) : (
            <div className="space-y-0 border rounded-lg overflow-hidden">
              {filteredDecks.map((deck) => (
                <DeckListItem key={deck.id} deck={deck} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
