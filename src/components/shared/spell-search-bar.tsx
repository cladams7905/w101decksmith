import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { spellCategories } from "@/db/data";

interface SpellSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilters: Record<string, boolean>;
  onCategoryFiltersChange: (filters: Record<string, boolean>) => void;
  className?: string;
}

export function SpellSearchBar({
  searchQuery,
  onSearchChange,
  categoryFilters,
  onCategoryFiltersChange,
  className = ""
}: SpellSearchBarProps) {
  // Count how many filters are active
  const activeFilterCount =
    Object.values(categoryFilters).filter(Boolean).length;

  const selectAllCategories = () => {
    const allSelected = Object.fromEntries(
      Object.keys(categoryFilters).map((key) => [key, true])
    );
    onCategoryFiltersChange(allSelected);
  };

  const deselectAllCategories = () => {
    const allDeselected = Object.fromEntries(
      Object.keys(categoryFilters).map((key) => [key, false])
    );
    onCategoryFiltersChange(allDeselected);
  };

  const toggleCategoryFilter = (categoryId: string) => {
    onCategoryFiltersChange({
      ...categoryFilters,
      [categoryId]: !categoryFilters[categoryId]
    });
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search spells..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
                <div key={category.id} className="flex items-center space-x-2">
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
  );
}
