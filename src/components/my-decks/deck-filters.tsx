"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Grid, List, SlidersHorizontal } from "lucide-react";

interface DeckFiltersProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  filters: {
    type: string;
    school: string;
    level: string;
    sortBy: string;
  };
  onFiltersChange: (filters: {
    type: string;
    school: string;
    level: string;
    sortBy: string;
  }) => void;
}

export function DeckFilters({
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange
}: DeckFiltersProps) {
  const updateFilter = (key: keyof typeof filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const schools = [
    { value: "all", label: "All Schools" },
    { value: "fire", label: "Fire" },
    { value: "ice", label: "Ice" },
    { value: "storm", label: "Storm" },
    { value: "life", label: "Life" },
    { value: "death", label: "Death" },
    { value: "myth", label: "Myth" },
    { value: "balance", label: "Balance" },
    { value: "astral", label: "Astral" },
    { value: "shadow", label: "Shadow" }
  ];

  const types = [
    { value: "all", label: "All Types" },
    { value: "pve", label: "PvE" },
    { value: "pvp", label: "PvP" }
  ];

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "1-25", label: "1-25" },
    { value: "26-50", label: "26-50" },
    { value: "51-75", label: "51-75" },
    { value: "76-100", label: "76-100" },
    { value: "101-130", label: "101-130" },
    { value: "131-150", label: "131-150" },
    { value: "150+", label: "150+" }
  ];

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "name", label: "Name A-Z" },
    { value: "level", label: "Level" },
    { value: "school", label: "School" },
    { value: "views", label: "Most Viewed" },
    { value: "likes", label: "Most Liked" }
  ];

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b border-border bg-background/50">
      {/* Left side - Filters */}
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

        <Select
          value={filters.type}
          onValueChange={(value) => updateFilter("type", value)}
        >
          <SelectTrigger className="w-32" size="sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.school}
          onValueChange={(value) => updateFilter("school", value)}
        >
          <SelectTrigger className="w-36" size="sm">
            <SelectValue placeholder="School" />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school) => (
              <SelectItem key={school.value} value={school.value}>
                {school.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.level}
          onValueChange={(value) => updateFilter("level", value)}
        >
          <SelectTrigger className="w-32" size="sm">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter("sortBy", value)}
        >
          <SelectTrigger className="w-40" size="sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right side - View Toggle */}
      <div className="flex items-center gap-1 border rounded-lg p-1">
        <Button
          size="sm"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          onClick={() => onViewModeChange("grid")}
          className="h-7 w-7 p-0"
        >
          <Grid className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant={viewMode === "list" ? "secondary" : "ghost"}
          onClick={() => onViewModeChange("list")}
          className="h-7 w-7 p-0"
        >
          <List className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
