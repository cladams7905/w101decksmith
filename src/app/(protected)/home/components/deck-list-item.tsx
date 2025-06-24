"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSchoolIconPath } from "@/lib/spell-utils";
import type { Deck } from "@/db/database.types";
import {
  ExternalLink,
  Edit,
  Eye,
  Heart,
  MessageCircle,
  Lock
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DeckListItemProps {
  deck: Deck;
}

// Simple utility function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? "just now" : `${diffInMinutes}m ago`;
    }
    return diffInHours === 1 ? "1h ago" : `${diffInHours}h ago`;
  }

  if (diffInDays === 1) return "1d ago";
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return "1mo ago";
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? "1y ago" : `${diffInYears}y ago`;
}

export function DeckListItem({ deck }: DeckListItemProps) {
  const router = useRouter();
  const spellCount = Array.isArray(deck.spells) ? deck.spells.length : 0;
  const createdDate = new Date(deck.created_at);
  const timeAgo = getTimeAgo(createdDate);

  // Mock social stats - these would come from your database
  const stats = {
    views: Math.floor(Math.random() * 1000) + 50,
    likes: Math.floor(Math.random() * 100) + 5,
    comments: Math.floor(Math.random() * 20) + 1
  };

  const handleEditDeck = () => {
    router.push(`/decks?id=${deck.id}`);
  };

  const handleViewDeck = () => {
    router.push(`/decks?id=${deck.id}`);
  };

  const handleShareDeck = () => {
    console.log("Share deck:", deck.id);
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-border hover:bg-muted/50 transition-colors group">
      {/* Deck Preview Thumbnail */}
      <div className="w-16 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded border flex items-center justify-center flex-shrink-0">
        <Eye className="h-4 w-4 text-slate-400" />
      </div>

      {/* Deck Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate" title={deck.name}>
            {deck.name}
          </h3>
          {!deck.is_public && (
            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <img
              src={getSchoolIconPath(deck.school)}
              alt={`${deck.school} school`}
              className="w-3 h-3"
            />
            <span className="capitalize">{deck.school}</span>
          </div>

          <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
            Lvl {deck.level}
          </Badge>

          <span>{deck.is_pve ? "PvE" : "PvP"}</span>

          <span>{spellCount} cards</span>

          {deck.weaving_school && deck.weaving_school !== deck.school && (
            <div className="flex items-center gap-1">
              <span>+</span>
              <img
                src={getSchoolIconPath(deck.weaving_school)}
                alt={`${deck.weaving_school} school`}
                className="w-3 h-3"
              />
            </div>
          )}
        </div>
      </div>

      {/* Social Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{stats.views}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          <span>{stats.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          <span>{stats.comments}</span>
        </div>
      </div>

      {/* Created Date */}
      <div className="text-xs text-muted-foreground w-16 text-right">
        {timeAgo}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleViewDeck}
          className="h-7 w-7 p-0"
        >
          <Eye className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEditDeck}
          className="h-7 w-7 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
        {deck.is_public && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShareDeck}
            className="h-7 w-7 p-0"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
