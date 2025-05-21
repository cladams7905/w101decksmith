"use client";

import { BarChart, MessageSquare, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanel } from "@/components/resizable-panel";
import DeckStats from "@/components/deck-stats";
import DeckComments from "@/components/deck-comments";
import type { Deck } from "@/lib/types";
import { useEffect, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

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
    return <MobileRightSidebar deck={deck} />;
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
              <DeckComments deck={deck} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </div>
    </div>
  );
}

function MobileRightSidebar({ deck }: { deck: Deck }) {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full shadow-lg bg-purple-700 hover:bg-purple-600"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 gradient-linear">
        <Tabs defaultValue="stats" className="w-full h-full flex flex-col">
          <div className="border-b border-blue-900/30">
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-12">
              <TabsTrigger
                value="stats"
                className="rounded-none data-[state=active]:bg-blue-950/50 data-[state=active]:shadow-none"
              >
                <BarChart className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="rounded-none data-[state=active]:bg-blue-950/50 data-[state=active]:shadow-none"
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
            <DeckComments deck={deck} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
