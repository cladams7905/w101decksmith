"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface MobileNavigationProps {
  isDeckPage: boolean;
}

export function MobileNavigation({}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleCreateDeck = () => {
    setIsOpen(false);
    router.push("/create");
  };

  const handleMyDecks = () => {
    setIsOpen(false);
    router.push("/my-decks");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden mr-2 p-2">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex flex-col space-y-4 pt-8">
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>

          {/* Create Deck */}
          <Button
            variant="outline_primary"
            className="w-full justify-start"
            onClick={handleCreateDeck}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Deck
          </Button>

          {/* My Decks */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleMyDecks}
          >
            <Home className="h-4 w-4 mr-2" />
            My Decks
          </Button>

          {/* Community Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2">
              Community
            </h3>
            <div className="space-y-1">
              <Link href="/community/gallery" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Deck Gallery
                </Button>
              </Link>
              <Link
                href="/community/leaderboards"
                onClick={() => setIsOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  Leaderboards
                </Button>
              </Link>
              <Link
                href="/community/tournaments"
                onClick={() => setIsOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  Tournaments
                </Button>
              </Link>
              <Link href="/community/guides" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Guides & Tips
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
