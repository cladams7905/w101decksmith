"use client";

import React, { useState } from "react";
import { DeckGallery } from "./components/deck-gallery";
import { StatusSidebar } from "./components/status-sidebar";

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState("my-decks");

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Deck Navigation */}
      <div className="w-80 flex-shrink-0">
        <StatusSidebar
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>

      {/* Main Content - Deck Gallery */}
      <div className="flex-1 overflow-hidden">
        <DeckGallery selectedFilter={selectedFilter} />
      </div>
    </div>
  );
}
