"use client";

import { BarChart, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanel } from "@/components/shared/resizable-panel";
import DeckStats from "@/components/right-sidebar/deck-stats";
import DeckComments from "@/components/right-sidebar/deck-comments";
import { SpellSidebar } from "@/components/spell-sidebar";
import type { Deck } from "@/db/database.types";
import { useEffect, useState } from "react";
import { useDeck } from "@/lib/contexts/deck-context";

interface RightSidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  panelWidth: number;
  onWidthChange: (width: number) => void;
  deck: Deck;
}

export function RightSidebar({
  isOpen,
  isMobile,
  panelWidth,
  onWidthChange,
  deck
}: RightSidebarProps) {
  const [, setIsVisible] = useState(isOpen);
  const [, setIsAnimating] = useState(false);

  // Handle animation states when isOpen changes
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      // After animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      // After animation completes, hide the element
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (isMobile) {
    return (
      <>
        <MobileRightSidebar deck={deck} isOpen={isOpen} />
        <MobileSpellSidebar deck={deck} />
      </>
    );
  }

  return (
    <div
      className={`hidden md:block transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? `w-[${panelWidth}px]` : "w-0"
      }`}
      style={{ width: isOpen ? `${panelWidth}px` : 0 }}
    >
      <div
        className={`h-full transition-all duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
        }`}
      >
        <ResizablePanel
          side="right"
          defaultWidth={panelWidth}
          minWidth={240}
          maxWidth={400}
          onWidthChange={onWidthChange}
          className="h-[calc(100vh-4rem)] border-l"
        >
          <Tabs defaultValue="stats" className="w-full h-full flex flex-col">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-2 p-0 h-12">
                <TabsTrigger
                  value="stats"
                  className="rounded-none data-[state=active]:blue-900/60 data-[state=active]:shadow-none"
                >
                  <BarChart className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="rounded-none data-[state=active]:blue-900/60 data-[state=active]:shadow-none"
                >
                  <MessageSquare className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="stats" className="p-4 m-0 flex-1 overflow-auto">
              <DeckStats deck={deck} />
            </TabsContent>
            <TabsContent
              value="comments"
              className="p-0 m-0 flex-1 overflow-auto"
            >
              <DeckComments />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </div>
    </div>
  );
}

function MobileRightSidebar({ deck, isOpen }: { deck: Deck; isOpen: boolean }) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
      <div className="absolute right-0 top-16 bottom-0 w-[300px] bg-background border-l">
        <Tabs defaultValue="stats" className="w-full h-full flex flex-col">
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-2 p-0 h-12">
              <TabsTrigger
                value="stats"
                className="rounded-none data-[state=active]:blue-900/60 data-[state=active]:shadow-none"
              >
                <BarChart className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="rounded-none data-[state=active]:blue-900/60 data-[state=active]:shadow-none"
              >
                <MessageSquare className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="stats" className="p-4 m-0 flex-1 overflow-auto">
            <DeckStats deck={deck} />
          </TabsContent>
          <TabsContent
            value="comments"
            className="p-0 m-0 flex-1 overflow-auto"
          >
            <DeckComments />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MobileSpellSidebar({ deck }: { deck: Deck }) {
  const { addSpell } = useDeck();

  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full shadow-lg bg-purple-700 hover:bg-purple-600"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] p-0 bg-background flex flex-col pt-8"
      >
        <SheetTitle className="sr-only">Spell Library</SheetTitle>
        <div className="flex-1 overflow-auto">
          <div className="h-full overflow-y-auto">
            <SpellSidebar onAddSpell={addSpell} currentDeck={deck} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
