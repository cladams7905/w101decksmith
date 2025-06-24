"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  useDeckPageContextOptional,
  DeckPageProvider
} from "@/components/deck-builder/deck-page-provider";
import { DeckProvider } from "@/lib/contexts/deck-context";
import { UIProvider } from "@/lib/contexts/ui-context";
import { SidebarProvider } from "@/components/ui/sidebar";

function ConditionalAppHeader() {
  const pathname = usePathname();
  const isDeckPage = pathname.includes("/decks");
  const deckContext = useDeckPageContextOptional();

  if (isDeckPage) {
    // For deck pages, use the context toggle function or provide a minimal fallback
    const toggleFunction =
      deckContext?.onToggleRightSidebar ||
      (() => {
        console.warn("Toggle sidebar function not available yet");
      });

    return (
      <AppHeader
        isDeckPage={true}
        currentDeck={deckContext?.currentDeck}
        decks={deckContext?.decks || []}
        onSwitchDeck={deckContext?.onSwitchDeck}
        onToggleRightSidebar={toggleFunction}
        showNewDeckModal={deckContext?.showNewDeckModal || false}
        setShowNewDeckModal={deckContext?.setShowNewDeckModal || (() => {})}
        wizardSchool={deckContext?.wizardSchool || ""}
        wizardLevel={deckContext?.wizardLevel || ""}
        weavingClass={deckContext?.weavingClass || ""}
        rightSidebarOpen={deckContext?.rightSidebarOpen || false}
      />
    );
  }

  return <AppHeader isDeckPage={false} />;
}

function DeckPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeckProvider>
      <UIProvider>
        <SidebarProvider>
          <DeckPageProvider>
            <div className="h-screen w-full flex flex-col bg-background text-foreground">
              <ConditionalAppHeader />
              <div className="flex-1 overflow-hidden">{children}</div>
            </div>
          </DeckPageProvider>
        </SidebarProvider>
      </UIProvider>
    </DeckProvider>
  );
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDeckPage = pathname.includes("/decks");

  if (isDeckPage) {
    // Wrap deck pages with all necessary contexts including DeckPageProvider
    return <DeckPageLayout>{children}</DeckPageLayout>;
  }

  // For non-deck pages, use minimal layout
  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground">
      <ConditionalAppHeader />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <ProtectedContent>{children}</ProtectedContent>
    </TooltipProvider>
  );
}
