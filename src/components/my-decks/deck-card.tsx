"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSchoolIconPath } from "@/lib/spell-utils";
// Using a simple time calculation instead of date-fns
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

interface DeckCardProps {
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
      return diffInMinutes <= 1 ? "just now" : `${diffInMinutes} minutes ago`;
    }
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 30) return `${diffInDays} days ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return "1 month ago";
  if (diffInMonths < 12) return `${diffInMonths} months ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
}

export function DeckCard({ deck }: DeckCardProps) {
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
    router.push(`/deck/${deck.id}`);
  };

  const handleViewDeck = () => {
    // For now, same as edit - could be a read-only view later
    router.push(`/deck/${deck.id}`);
  };

  const handleShareDeck = () => {
    // TODO: Implement sharing functionality
    console.log("Share deck:", deck.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        {/* Deck Screenshot Placeholder */}
        <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center border-2 border-dashed border-slate-300">
          <div className="text-center">
            <Eye className="h-6 w-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Deck Preview</p>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle
                className="text-lg line-clamp-1 flex-1"
                title={deck.name}
              >
                {deck.name}
              </CardTitle>
              {!deck.is_public && (
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <img
                src={getSchoolIconPath(deck.school)}
                alt={`${deck.school} school`}
                className="w-4 h-4"
              />
              <span className="text-sm text-muted-foreground capitalize">
                {deck.school}
              </span>
              <Badge variant="secondary" className="text-xs">
                Level {deck.level}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Deck Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Cards:</span>
            <span className="ml-1 font-medium">{spellCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-1 font-medium">
              {deck.is_pve ? "PvE" : "PvP"}
            </span>
          </div>
        </div>

        {/* Weaving School */}
        {deck.weaving_school && deck.weaving_school !== deck.school && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Weaving:</span>
            <img
              src={getSchoolIconPath(deck.weaving_school)}
              alt={`${deck.weaving_school} school`}
              className="w-3 h-3"
            />
            <span className="text-xs capitalize">{deck.weaving_school}</span>
          </div>
        )}

        {/* Description */}
        {deck.description && (
          <p
            className="text-sm text-muted-foreground line-clamp-2"
            title={deck.description}
          >
            {deck.description}
          </p>
        )}

        {/* Social Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
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
          <span>Created {timeAgo}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            variant="default"
            onClick={handleEditDeck}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={handleViewDeck}>
            <Eye className="h-3 w-3" />
          </Button>
          {deck.is_public && (
            <Button size="sm" variant="outline" onClick={handleShareDeck}>
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Public Badge */}
        {deck.is_public && (
          <div className="flex justify-end">
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
