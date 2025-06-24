"use client";

import React, { useState } from "react";
// Removed unused Card components
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UpgradeMembershipModal } from "@/components/spell-sidebar/upgrade-membership-modal";
import {
  Heart,
  Users,
  User,
  FolderPlus,
  Folder,
  ChevronRight,
  ChevronDown,
  Newspaper,
  Crown
} from "lucide-react";

interface DeckSidebarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function StatusSidebar({
  selectedFilter = "my-decks",
  onFilterChange = () => {}
}: Partial<DeckSidebarProps> = {}) {
  const [expandedCollections, setExpandedCollections] = useState<string[]>([]);

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const deckFilters = [
    { id: "my-decks", label: "My Decks", icon: User, count: 12 },
    { id: "favorites", label: "Favorites", icon: Heart, count: 3 },
    {
      id: "shared-with-me",
      label: "Decks Shared with Me",
      icon: Users,
      count: 7
    }
  ];

  // Mock collections data
  const collections = [
    {
      id: "pvp-builds",
      name: "PvP Builds",
      count: 5,
      decks: ["Fire PvP Master", "Ice Tank Build", "Storm Glass Cannon"]
    },
    {
      id: "pve-farming",
      name: "PvE Farming",
      count: 8,
      decks: ["Mooshu Farm", "Azteca Quest", "Karamelle Speed Run"]
    },
    {
      id: "experiments",
      name: "Experiments",
      count: 3,
      decks: ["Shadow Pip Test", "New School Mix"]
    }
  ];

  const newsItems = [
    {
      title: "New Spell Cards Added",
      type: "New",
      description: "Latest Karamelle spells now available"
    },
    {
      title: "UI Improvements",
      type: "Update",
      description: "Enhanced deck builder interface"
    },
    {
      title: "Community Features",
      type: "Coming Soon",
      description: "Share decks with the community"
    }
  ];

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="flex-1 overflow-auto">
        {/* Deck Filters Section */}
        <div className="p-4">
          <div className="space-y-1">
            {deckFilters.map((filter) => {
              const Icon = filter.icon;
              const isSelected = selectedFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-linear-to-br from-blue-900/40 border border-border text-purple-100 font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{filter.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {filter.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Collections Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Collections</h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <FolderPlus className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-1">
            {collections.map((collection) => {
              const isExpanded = expandedCollections.includes(collection.id);

              return (
                <div key={collection.id}>
                  <button
                    onClick={() => toggleCollection(collection.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <Folder className="h-4 w-4" />
                      <span>{collection.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {collection.count}
                    </Badge>
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {collection.decks.map((deckName, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {deckName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* News Section */}
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Newspaper className="h-4 w-4" />
            <h3 className="text-sm font-medium text-foreground">News</h3>
          </div>

          <div className="space-y-3">
            {newsItems.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium">{item.title}</h4>
                  <Badge
                    variant={item.type === "New" ? "default" : "outline"}
                    className="text-xs"
                  >
                    {item.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Membership Button - Fixed at bottom */}
      <div className="p-4 border-t border-border">
        <UpgradeMembershipModal
          trigger={
            <Button variant="outline_primary" className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Membership
            </Button>
          }
        />
      </div>
    </div>
  );
}
