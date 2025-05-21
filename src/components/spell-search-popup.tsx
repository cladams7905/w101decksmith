"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/spell-tooltip";
import type { Spell } from "@/lib/types";
import { spellCategories } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SpellSearchPopupProps {
  position: { top: number; left: number };
  onClose: () => void;
  onSelectSpell: (spell: Spell, quantity: number) => void;
  availableSlots: number;
  isReplacing?: boolean;
}

export default function SpellSearchPopup({
  position,
  onClose,
  onSelectSpell,
  availableSlots,
  isReplacing = false
}: SpellSearchPopupProps) {
  const [spellQuantity, setSpellQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);

  // Category filter state
  const [categoryFilters, setCategoryFilters] = useState<
    Record<string, boolean>
  >(
    spellCategories.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Filter spells based on search query and category filters
  const filteredSpells = spellCategories
    .filter((category) => categoryFilters[category.id])
    .map((category) => ({
      ...category,
      spells: category.spells.filter(
        (spell) =>
          spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spell.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter((category) => category.spells.length > 0);

  const toggleCategoryFilter = (categoryId: string) => {
    setCategoryFilters((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const selectAllCategories = () => {
    const allSelected = Object.fromEntries(
      Object.keys(categoryFilters).map((key) => [key, true])
    );
    setCategoryFilters(allSelected);
  };

  const deselectAllCategories = () => {
    const allDeselected = Object.fromEntries(
      Object.keys(categoryFilters).map((key) => [key, false])
    );
    setCategoryFilters(allDeselected);
  };

  // Count how many filters are active
  const activeFilterCount =
    Object.values(categoryFilters).filter(Boolean).length;

  // Adjust position to ensure popup stays within viewport
  const adjustedPosition = { ...position };

  // Check if we need to adjust the position based on viewport
  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust horizontal position if needed
      if (rect.right > viewportWidth) {
        const overflow = rect.right - viewportWidth;
        adjustedPosition.left = Math.max(0, position.left - overflow - 20);
      }

      // Adjust vertical position if needed
      if (rect.bottom > viewportHeight) {
        const overflow = rect.bottom - viewportHeight;
        adjustedPosition.top = Math.max(0, position.top - overflow - 20);
      }
    }
  }, [position]);

  return (
    <div
      ref={popupRef}
      className="fixed z-50 gradient border rounded-xl shadow-2xl p-4 w-80 max-h-[80vh] flex flex-col"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">
          {isReplacing ? "Replace Spell" : "Add Spell to Deck"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search spells..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
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
                      id={`popup-filter-${category.id}`}
                      checked={categoryFilters[category.id]}
                      onCheckedChange={() => toggleCategoryFilter(category.id)}
                    />
                    <label
                      htmlFor={`popup-filter-${category.id}`}
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

      {!isReplacing && (
        <>
          <div className="text-xs text-muted-foreground mb-3">
            {availableSlots} {availableSlots === 1 ? "slot" : "slots"} available
            in deck
            {spellQuantity > 1 && (
              <span className="ml-1">
                (adding {spellQuantity}{" "}
                {spellQuantity === 1 ? "copy" : "copies"})
              </span>
            )}
          </div>

          <div className="space-y-3 mb-3 border-t border-blue-900/30 pt-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="popup-spell-quantity">Quantity</Label>
              <span className="text-sm font-medium">{spellQuantity}</span>
            </div>
            <Slider
              id="popup-spell-quantity"
              min={1}
              max={Math.min(4, availableSlots)}
              step={1}
              value={[spellQuantity]}
              onValueChange={(value) => setSpellQuantity(value[0])}
              className="w-full"
            />
          </div>
        </>
      )}

      {isReplacing && (
        <div className="text-xs text-amber-400 mb-3 border-t border-blue-900/30 pt-3">
          You are replacing an existing spell. Select a new spell to replace it.
        </div>
      )}

      <div className="overflow-y-auto flex-1">
        <TooltipProvider>
          <Accordion type="multiple" className="w-full">
            {filteredSpells.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${category.color}-500`}
                    ></div>
                    <span>{category.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-2 p-1">
                    {category.spells.map((spell) => (
                      <Tooltip key={spell.id}>
                        <TooltipTrigger asChild>
                          <Card
                            className="cursor-pointer hover:bg-accent transition-colors spell-card"
                            onClick={() =>
                              onSelectSpell(
                                spell,
                                isReplacing ? 1 : spellQuantity
                              )
                            }
                          >
                            <CardContent className="p-3 flex flex-col">
                              <div className="flex justify-between items-center mb-1">
                                <div className="font-medium truncate">
                                  {spell.name}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`bg-${category.color}-900 text-${category.color}-100 ml-1 shrink-0`}
                                >
                                  {spell.pips}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {spell.description}
                              </div>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          align="start"
                          className="p-0 border-0"
                        >
                          <SpellTooltip
                            spell={spell}
                            schoolColor={category.color}
                          />
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TooltipProvider>
      </div>
    </div>
  );
}
