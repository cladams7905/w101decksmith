"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DeckProvider } from "@/lib/contexts/deck-context";
import { UIProvider } from "@/lib/contexts/ui-context";
import { DeckBuilderLayout } from "./deck-builder/deck-builder-layout";

export default function DeckBuilder() {
  return (
    <TooltipProvider delayDuration={300}>
      <DeckProvider>
        <UIProvider>
          <SidebarProvider>
            <DeckBuilderLayout />
          </SidebarProvider>
        </UIProvider>
      </DeckProvider>
    </TooltipProvider>
  );
}
