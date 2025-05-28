import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSpellsData } from "@/lib/hooks/use-spells-data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useCallback } from "react";
import type { Spell } from "@/lib/types";

interface SpellSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFilterChange: (
    filteredSpells: {
      id: string;
      name: string;
      color: string;
      spells: Spell[];
    }[]
  ) => void;
}

export function SpellSearch({
  searchQuery,
  setSearchQuery,
  onFilterChange
}: SpellSearchProps) {
  const { spellCategories } = useSpellsData();

  // Category filter state
  const [categoryFilters, setCategoryFilters] = useState<
    Record<string, boolean>
  >({});

  // Initialize category filters when spell categories are loaded
  useEffect(() => {
    if (
      spellCategories.length > 0 &&
      Object.keys(categoryFilters).length === 0
    ) {
      const initialFilters = spellCategories.reduce((acc, category) => {
        acc[category.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setCategoryFilters(initialFilters);
    }
  }, [spellCategories, categoryFilters]);

  const updateFilteredSpells = useCallback(
    (query: string, filters: Record<string, boolean>) => {
      const filtered = spellCategories
        .filter((category) => filters[category.id])
        .map((category) => ({
          ...category,
          spells: category.spells.filter(
            (spell: Spell) =>
              spell.name.toLowerCase().includes(query.toLowerCase()) ||
              spell.description?.toLowerCase().includes(query.toLowerCase())
          )
        }))
        .filter((category) => category.spells.length > 0);

      onFilterChange(filtered);
    },
    [onFilterChange, spellCategories]
  );

  useEffect(() => {
    if (Object.keys(categoryFilters).length > 0) {
      updateFilteredSpells(searchQuery, categoryFilters);
    }
  }, [categoryFilters, searchQuery, updateFilteredSpells]);

  // Count how many filters are active
  const activeFilterCount =
    Object.values(categoryFilters).filter(Boolean).length;

  const selectAllCategories = () => {
    const allSelected = Object.fromEntries(
      Object.keys(categoryFilters).map((key) => [key, true])
    );
    setCategoryFilters(allSelected);
    updateFilteredSpells(searchQuery, allSelected);
  };

  const deselectAllCategories = () => {
    const allDeselected = Object.fromEntries(
      Object.keys(categoryFilters).map((key) => [key, false])
    );
    setCategoryFilters(allDeselected);
    updateFilteredSpells(searchQuery, allDeselected);
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setCategoryFilters((prev) => {
      const newFilters = {
        ...prev,
        [categoryId]: !prev[categoryId]
      };
      updateFilteredSpells(searchQuery, newFilters);
      return newFilters;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    updateFilteredSpells(newQuery, categoryFilters);
  };

  return (
    <div className="p-4 border-b border-blue-900/30 sticky top-0 z-10 bg-background">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search spells..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {activeFilterCount < spellCategories.length && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Categories</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllCategories}
                    className="h-7 text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllCategories}
                    className="h-7 text-xs"
                  >
                    None
                  </Button>
                </div>
              </div>
              <div className="space-y-1 pt-2">
                {spellCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`filter-${category.id}`}
                      checked={categoryFilters[category.id]}
                      onCheckedChange={() => toggleCategoryFilter(category.id)}
                    />
                    <label
                      htmlFor={`filter-${category.id}`}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-${category.color}-500`}
                      ></div>
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
