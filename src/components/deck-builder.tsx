"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Bell,
  Heart,
  MessageSquare,
  TrendingUp,
  X
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResizablePanel } from "@/components/resizable-panel";
import DeckGrid from "@/components/deck-grid";
import type { Spell, Deck } from "@/lib/types";
import { spellCategories } from "@/lib/data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/spell-tooltip";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { AppHeader } from "@/components/app-header";
import { DeckHeader } from "@/components/deck-header";
import { RightSidebar } from "@/components/right-sidebar";
import { BulkActionDialog } from "@/components/bulk-action-dialog";
import { UpgradeMembershipModal } from "@/components/upgrade-membership-modal";

function NotificationItem({
  type,
  content,
  time,
  read
}: {
  type: string;
  content: string;
  time: string;
  read: boolean;
}) {
  const getIcon = () => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className={`p-3 ${read ? "" : "bg-purple-900/10"}`}>
      <div className="flex gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="space-y-1">
          <p className="text-sm">{content}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}

export default function DeckBuilder() {
  const [currentDeck, setCurrentDeck] = useState<Deck>({
    id: "1",
    name: "Fire PvP Deck",
    spells: [],
    rightSidebarOpen: true
  });
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: "1",
      name: "Fire PvP Deck",
      spells: [],
      school: "fire",
      level: "150",
      weavingClass: "pyromancer"
    },
    {
      id: "2",
      name: "Ice Tank Deck",
      spells: [],
      school: "ice",
      level: "140",
      weavingClass: "thaumaturge"
    },
    {
      id: "3",
      name: "Storm Damage Deck",
      spells: [],
      school: "storm",
      level: "160",
      weavingClass: "diviner"
    },
    {
      id: "4",
      name: "Life Healing Deck",
      spells: [],
      school: "life",
      level: "150",
      weavingClass: "theurgist"
    }
  ]);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [showDeckSwitchModal, setShowDeckSwitchModal] = useState(false);
  const [showDeckSettingsModal, setShowDeckSettingsModal] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState(currentDeck.name);
  const [wizardLevel, setWizardLevel] = useState("150");
  const [wizardSchool, setWizardSchool] = useState("fire");
  const [weavingClass, setWeavingClass] = useState("pyromancer");
  const [deckSearchQuery, setDeckSearchQuery] = useState("");
  const [newDeckName, setNewDeckName] = useState(""); // Declare newDeckName variable
  const [searchQuery, setSearchQuery] = useState(""); // Declare searchQuery variable

  const [sortBy, setSortBy] = useState<"school" | "pips" | "utility" | "none">(
    "none"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Add these new state variables after the other state declarations (around line 80)
  const [schoolSortOptions, setSchoolSortOptions] = useState<
    Record<string, { by: "pips" | "utility" | "none"; order: "asc" | "desc" }>
  >({});

  // Spell quantity popup state
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [spellQuantity, setSpellQuantity] = useState(1);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const spellCardRef = useRef<HTMLDivElement>(null);

  // Category filter state
  const [categoryFilters, setCategoryFilters] = useState<
    Record<string, boolean>
  >(
    spellCategories.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const [selectedSpellType, setSelectedSpellType] = useState<string | null>(
    null
  );
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"edit" | "delete">(
    "edit"
  );
  const [isSpellId, setIsSpellId] = useState<boolean>(false);

  const handleSelectSpellsByType = (
    typeId: string,
    actionType: "edit" | "delete",
    isSpellId = false
  ) => {
    setSelectedSpellType(typeId);
    setIsSpellId(isSpellId);
    setBulkActionType(actionType);
    setShowBulkActionDialog(true);
  };

  const handleDeleteSpellsByType = (typeId: string, isSpellId = false) => {
    // Filter out all spells of the selected type
    const newSpells = isSpellId
      ? currentDeck.spells.filter((spell) => spell.id !== typeId)
      : currentDeck.spells.filter((spell) => spell.school !== typeId);

    // Update the current deck
    setCurrentDeck({
      ...currentDeck,
      spells: newSpells
    });

    // Update the deck in the decks array
    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
    );
    setDecks(updatedDecks);
  };

  const handleBulkReplaceSpell = (newSpell: Spell) => {
    if (!selectedSpellType) return;

    // Replace all spells of the selected type with the new spell
    const newSpells = currentDeck.spells.map((spell) =>
      isSpellId
        ? spell.id === selectedSpellType
          ? newSpell
          : spell
        : spell.school === selectedSpellType
        ? newSpell
        : spell
    );

    // Update the current deck
    setCurrentDeck({
      ...currentDeck,
      spells: newSpells
    });

    // Update the deck in the decks array
    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
    );
    setDecks(updatedDecks);

    // Close the dialog
    setShowBulkActionDialog(false);
    setSelectedSpellType(null);
  };

  // Add this function inside the DeckBuilder component, after the other deck manipulation functions
  const handleSortDeck = (sortedSpells: Spell[]) => {
    // Update the current deck with the sorted spells
    setCurrentDeck({
      ...currentDeck,
      spells: sortedSpells
    });

    // Update the deck in the decks array
    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: sortedSpells } : deck
    );
    setDecks(updatedDecks);
  };

  const handleSort = (value: string) => {
    if (value === "none") {
      setSortBy("none");
      return;
    }

    const [by, order] = value.split("-") as [
      "school" | "pips" | "utility",
      "asc" | "desc"
    ];
    setSortBy(by);
    setSortOrder(order);
    sortDeck(by, order);
  };

  // Add the sortDeck function
  const sortDeck = (
    by: "school" | "pips" | "utility" | "none",
    order: "asc" | "desc"
  ) => {
    if (by === "none") return;

    const sortedSpells = [...currentDeck.spells].sort((a, b) => {
      if (by === "school") {
        // Sort by school name
        const schoolA = a.school.toLowerCase();
        const schoolB = b.school.toLowerCase();
        return order === "asc"
          ? schoolA.localeCompare(schoolB)
          : schoolB.localeCompare(schoolA);
      } else if (by === "pips") {
        // Sort by pip cost
        return order === "asc" ? a.pips - b.pips : b.pips - a.pips;
      } else if (by === "utility") {
        // Sort by utility type
        const getUtilityType = (spell: Spell): number => {
          if (spell.damage && spell.damage > 0) return 1; // Damage
          if (spell.damageOverTime && spell.damageOverTime > 0) return 2; // DoT
          if (spell.buffPercentage && spell.buffPercentage > 0) return 3; // Buff
          if (spell.debuffPercentage && spell.debuffPercentage > 0) return 4; // Debuff
          if (spell.healing && spell.healing > 0) return 5; // Healing
          if (spell.healingOverTime && spell.healingOverTime > 0) return 6; // HoT
          if (spell.pipsGained && spell.pipsGained > 0) return 7; // Pip gain
          return 8; // Other
        };

        const typeA = getUtilityType(a);
        const typeB = getUtilityType(b);
        return order === "asc" ? typeA - typeB : typeB - typeA;
      }

      return 0;
    });

    // Update the current deck
    setCurrentDeck({
      ...currentDeck,
      spells: sortedSpells
    });

    // Update the deck in the decks array
    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: sortedSpells } : deck
    );
    setDecks(updatedDecks);
  };

  // Add this function after the other utility functions (around line 400)
  const toggleSchoolSort = (
    schoolId: string,
    by: "pips" | "utility" | "none"
  ) => {
    setSchoolSortOptions((prev) => {
      const currentSort = prev[schoolId] || { by: "none", order: "asc" };
      const newOrder =
        currentSort.by === by && currentSort.order === "asc" ? "desc" : "asc";

      return {
        ...prev,
        [schoolId]: { by, order: newOrder }
      };
    });
  };

  // Add this function after the toggleSchoolSort function
  const getSortedSchoolSpells = (category: (typeof filteredSpells)[0]) => {
    const sortOption = schoolSortOptions[category.id] || {
      by: "none",
      order: "asc"
    };

    if (sortOption.by === "none") {
      return category.spells;
    }

    return [...category.spells].sort((a, b) => {
      if (sortOption.by === "pips") {
        return sortOption.order === "asc" ? a.pips - b.pips : b.pips - a.pips;
      } else if (sortOption.by === "utility") {
        // Sort by utility type
        const getUtilityType = (spell: Spell): number => {
          if (spell.damage && spell.damage > 0) return 1; // Damage
          if (spell.damageOverTime && spell.damageOverTime > 0) return 2; // DoT
          if (spell.buffPercentage && spell.buffPercentage > 0) return 3; // Buff
          if (spell.debuffPercentage && spell.debuffPercentage > 0) return 4; // Debuff
          if (spell.healing && spell.healing > 0) return 5; // Healing
          if (spell.healingOverTime && spell.healingOverTime > 0) return 6; // HoT
          if (spell.pipsGained && spell.pipsGained > 0) return 7; // Pip gain
          return 8; // Other
        };

        const typeA = getUtilityType(a);
        const typeB = getUtilityType(b);
        return sortOption.order === "asc" ? typeA - typeB : typeB - typeA;
      }
      return 0;
    });
  };

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setRightSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update edited deck name when current deck changes
  useEffect(() => {
    setEditedDeckName(currentDeck.name);
  }, [currentDeck]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedSpell &&
        spellCardRef.current &&
        !spellCardRef.current.contains(event.target as Node)
      ) {
        setSelectedSpell(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedSpell]);

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

  const handleSpellClick = (spell: Spell, event: React.MouseEvent) => {
    // Get the position of the clicked element
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    setPopupPosition({
      top: rect.top,
      left: rect.right + 10 // Position to the right with a small gap
    });

    setSelectedSpell(spell);
    setSpellQuantity(1); // Reset quantity to 1
  };

  const handleAddSpell = () => {
    if (!selectedSpell) return;

    if (currentDeck.spells.length + spellQuantity <= 64) {
      // 8x8 grid
      // Create an array with the selected spell repeated spellQuantity times
      const spellsToAdd = Array(spellQuantity).fill(selectedSpell);

      setCurrentDeck({
        ...currentDeck,
        spells: [...currentDeck.spells, ...spellsToAdd]
      });

      // Update the deck in the decks array
      const updatedDecks = decks.map((deck) =>
        deck.id === currentDeck.id
          ? { ...deck, spells: [...deck.spells, ...spellsToAdd] }
          : deck
      );
      setDecks(updatedDecks);
    }

    // Close the popup
    setSelectedSpell(null);
  };

  const handleAddSpellToSlot = (
    spell: Spell,
    slotIndex: number,
    quantity = 1
  ) => {
    // Create a copy of the current spells
    const newSpells = [...currentDeck.spells];

    // Find the next available slot, starting from the current deck length
    const startIndex = newSpells.length;

    // Add the spell at the next available slot(s)
    for (let i = 0; i < quantity; i++) {
      if (startIndex + i < 64) {
        // Make sure we don't exceed the grid size
        newSpells[startIndex + i] = spell;
      }
    }

    // Update the current deck
    setCurrentDeck({
      ...currentDeck,
      spells: newSpells
    });

    // Update the deck in the decks array
    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
    );
    setDecks(updatedDecks);
  };

  const handleReplaceSpell = (spell: Spell, index: number) => {
    // Create a copy of the current spells
    const newSpells = [...currentDeck.spells];

    // Replace the spell at the specified index
    if (index < newSpells.length) {
      newSpells[index] = spell;
    }

    // Update the current deck
    setCurrentDeck({
      ...currentDeck,
      spells: newSpells
    });

    // Update the deck in the decks array
    const updatedDecks = decks.map((deck) =>
      deck.id === currentDeck.id ? { ...deck, spells: newSpells } : deck
    );
    setDecks(updatedDecks);
  };

  const handleCreateNewDeck = () => {
    if (newDeckName.trim()) {
      const newDeck = {
        id: Date.now().toString(),
        name: newDeckName,
        spells: [],
        school: wizardSchool,
        level: wizardLevel,
        weavingClass: weavingClass
      };
      setDecks([...decks, newDeck]);
      setCurrentDeck(newDeck);
      setNewDeckName("");
      setShowNewDeckModal(false);
    }
  };

  const handleSwitchDeck = (deck: Deck) => {
    setCurrentDeck(deck);
    setShowDeckSwitchModal(false);
  };

  const toggleRightSidebar = () => {
    // If we're opening the sidebar and have no stored width, use the default
    if (!rightSidebarOpen && rightPanelWidth === 0) {
      setRightPanelWidth(280);
    }

    setRightSidebarOpen(!rightSidebarOpen);

    // Update the currentDeck object with the new sidebar state
    setCurrentDeck({
      ...currentDeck,
      rightSidebarOpen: !rightSidebarOpen
    });
  };

  const handleSaveDeckName = () => {
    if (editedDeckName.trim()) {
      const updatedDeck = { ...currentDeck, name: editedDeckName };
      setCurrentDeck(updatedDeck);

      // Update the deck in the decks array
      const updatedDecks = decks.map((deck) =>
        deck.id === currentDeck.id ? updatedDeck : deck
      );
      setDecks(updatedDecks);
    }
    setIsEditingDeckName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveDeckName();
    } else if (e.key === "Escape") {
      setEditedDeckName(currentDeck.name);
      setIsEditingDeckName(false);
    }
  };

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

  const renderSidebarContent = () => (
    <>
      <div className="p-4 border-b border-blue-900/30 z-10 w-full sticky top-0 bg-background">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search spells..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                        onCheckedChange={() =>
                          toggleCategoryFilter(category.id)
                        }
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
      <Accordion type="multiple" className="w-full">
        {filteredSpells.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <div className="sticky top-14 z-5 bg-background">
              <AccordionTrigger className="py-2 px-3 sticky top-32">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-3 h-3 rounded-full bg-${category.color}-500`}
                  ></div>
                  <span>{category.name}</span>
                </div>
                <div
                  className="flex items-center gap-1 mr-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 relative ${
                          schoolSortOptions[category.id]?.by === "pips"
                            ? "bg-accent/50"
                            : ""
                        }`}
                        onClick={() => toggleSchoolSort(category.id, "pips")}
                      >
                        {schoolSortOptions[category.id]?.by === "pips" && (
                          <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-purple-600 text-[8px] text-white translate-x-1/3 -translate-y-1/3">
                            {schoolSortOptions[category.id]?.order === "asc"
                              ? "↑"
                              : "↓"}
                          </span>
                        )}
                        <span className="text-xs font-mono">1-9</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Sort by pip cost</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 relative ${
                          schoolSortOptions[category.id]?.by === "utility"
                            ? "bg-accent/50"
                            : ""
                        }`}
                        onClick={() => toggleSchoolSort(category.id, "utility")}
                      >
                        {schoolSortOptions[category.id]?.by === "utility" && (
                          <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-purple-600 text-[8px] text-white translate-x-1/3 -translate-y-1/3">
                            {schoolSortOptions[category.id]?.order === "asc"
                              ? "↑"
                              : "↓"}
                          </span>
                        )}
                        <span className="text-xs">⚡</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Sort by utility type
                    </TooltipContent>
                  </Tooltip>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 p-1">
                {getSortedSchoolSpells(category).map((spell) => (
                  <Tooltip key={spell.id}>
                    <TooltipTrigger asChild>
                      <Card
                        className="cursor-pointer hover:bg-accent hover:border-primary active:border-primary transition-colors spell-card"
                        onClick={(e) => handleSpellClick(spell, e)}
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
                      className="p-0 border-0 rounded-xl"
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
      {/* Spell Quantity Popup */}
      {selectedSpell && (
        <div
          ref={spellCardRef}
          className="fixed z-50 gradient border rounded-md shadow-xl p-4 w-64"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            transform: "translateY(-50%)"
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">{selectedSpell.name}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSelectedSpell(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="spell-quantity">Quantity</Label>
                <span className="text-sm font-medium">{spellQuantity}</span>
              </div>
              <Slider
                id="spell-quantity"
                min={1}
                max={Math.min(4, 64 - currentDeck.spells.length)}
                step={1}
                value={[spellQuantity]}
                onValueChange={(value) => setSpellQuantity(value[0])}
                className="w-full"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {64 - currentDeck.spells.length} slots available
              </div>
              <Button
                onClick={handleAddSpell}
                disabled={currentDeck.spells.length + spellQuantity > 64}
              >
                Add to Deck
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(deckSearchQuery.toLowerCase())
  );

  function handleDeleteDeck() {
    // Don't allow deleting if it's the only deck
    if (decks.length <= 1) {
      return;
    }

    // Filter out the current deck
    const updatedDecks = decks.filter((deck) => deck.id !== currentDeck.id);
    setDecks(updatedDecks);

    // Switch to another deck
    setCurrentDeck(updatedDecks[0]);

    // Close the modal
    setShowDeckSettingsModal(false);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
        {/* Top Navigation Bar */}
        <AppHeader
          currentDeck={currentDeck}
          decks={decks}
          onSwitchDeck={handleSwitchDeck}
          onCreateDeck={handleCreateNewDeck}
          onToggleRightSidebar={toggleRightSidebar}
          renderSidebarContent={renderSidebarContent}
          showNewDeckModal={showNewDeckModal}
          setShowNewDeckModal={setShowNewDeckModal}
          showDeckSwitchModal={showDeckSwitchModal}
          setShowDeckSwitchModal={setShowDeckSwitchModal}
          wizardSchool={wizardSchool}
          wizardLevel={wizardLevel}
          weavingClass={weavingClass}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <SidebarProvider>
            {/* Left Sidebar - Spell Search */}
            <div className="hidden md:block">
              <ResizablePanel
                side="left"
                defaultWidth={leftPanelWidth}
                minWidth={240}
                maxWidth={500}
                onWidthChange={setLeftPanelWidth}
                className="h-[calc(100vh-4rem)] border-r"
              >
                <div className="h-full flex flex-col w-full">
                  <div className="flex-1 overflow-auto">
                    {renderSidebarContent()}
                  </div>
                  {/* Sticky sidebar footer with upgrade button */}
                  <div className="border-t p-4 sticky bottom-0 gradient-special">
                    <UpgradeMembershipModal />
                    <div className="text-xs text-muted-foreground text-center mt-2">
                      Wizard101 Deck Builder
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </div>

            {/* Center - Deck Grid */}
            <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
              <DeckHeader
                deck={currentDeck}
                isEditingDeckName={isEditingDeckName}
                setIsEditingDeckName={setIsEditingDeckName}
                editedDeckName={editedDeckName}
                setEditedDeckName={setEditedDeckName}
                onSaveDeckName={handleSaveDeckName}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onSelectSpellsByType={handleSelectSpellsByType}
                onDeleteSpellsByType={handleDeleteSpellsByType}
                showDeckSettingsModal={showDeckSettingsModal}
                setShowDeckSettingsModal={setShowDeckSettingsModal}
                wizardLevel={wizardLevel}
                setWizardLevel={setWizardLevel}
                wizardSchool={wizardSchool}
                setWizardSchool={setWizardSchool}
                weavingClass={weavingClass}
                setWeavingClass={setWeavingClass}
                decks={decks}
                onDeleteDeck={handleDeleteDeck}
              />
              <div className="flex-1 overflow-auto p-4 md:px-6 md:pb-6 pt-0">
                <DeckGrid
                  deck={currentDeck}
                  onAddSpell={handleAddSpellToSlot}
                  onReplaceSpell={handleReplaceSpell}
                  onSortDeck={handleSortDeck}
                />
              </div>
            </main>

            {/* Right Sidebar - Deck Stats */}
            <RightSidebar
              isOpen={rightSidebarOpen}
              isMobile={isMobile}
              panelWidth={rightPanelWidth}
              onWidthChange={setRightPanelWidth}
              deck={currentDeck}
            />
          </SidebarProvider>
        </div>

        {/* Bulk Action Dialog */}
        <BulkActionDialog
          open={showBulkActionDialog}
          onOpenChange={setShowBulkActionDialog}
          selectedSpellType={selectedSpellType}
          isSpellId={isSpellId}
          actionType={bulkActionType}
          currentDeck={currentDeck}
          onBulkReplaceSpell={handleBulkReplaceSpell}
          onDeleteSpellsByType={handleDeleteSpellsByType}
        />
      </div>
    </TooltipProvider>
  );
}
