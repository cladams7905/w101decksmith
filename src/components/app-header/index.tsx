import type { Deck, Spell } from "@/lib/types";
import { MobileMenuTrigger } from "./mobile-menu-trigger";
import { CommunityDropdown } from "./navigation/community-dropdown";
import { HeaderActions } from "./header-actions";
import { MyDecksDropdown } from "@/components/app-header/navigation/my-decks-dropdown";
import { NewDeckModal } from "@/components/app-header/navigation/new-deck-modal";
import { Button } from "@/components/ui/button";
import DecksmithLogo from "@/../public/DeckSmith_Logo.svg";
import Image from "next/image";

interface AppHeaderProps {
  currentDeck: Deck;
  decks: Deck[];
  onSwitchDeck: (deck: Deck) => void;
  // onCreateDeck: () => void;
  onToggleRightSidebar: () => void;
  showNewDeckModal: boolean;
  setShowNewDeckModal: (show: boolean) => void;
  wizardSchool: string;
  wizardLevel: string;
  weavingClass: string;
  onAddSpell: (spell: Spell, quantity: number) => void;
}

export function AppHeader({
  currentDeck,
  decks,
  onSwitchDeck,
  // onCreateDeck,
  onToggleRightSidebar,
  showNewDeckModal,
  setShowNewDeckModal,
  wizardSchool,
  wizardLevel,
  weavingClass,
  onAddSpell
}: AppHeaderProps) {
  return (
    <header className="h-16 border-b bg-linear-to-br from-blue-900/40 backdrop-blur supports-[backdrop-filter]:bg-opacity-80 flex items-center px-4 sticky top-0 z-50">
      <div className="flex items-center">
        <MobileMenuTrigger currentDeck={currentDeck} onAddSpell={onAddSpell} />

        {/* App Logo */}
        <Image
          src={DecksmithLogo}
          alt="DeckSmith"
          width={32}
          height={32}
          className="rounded-lg mr-2"
          priority
        />

        <CommunityDropdown />

        <MyDecksDropdown
          decks={decks}
          currentDeck={currentDeck}
          onSwitchDeck={onSwitchDeck}
          showNewDeckModal={showNewDeckModal}
          setShowNewDeckModal={setShowNewDeckModal}
          // onCreateDeck={onCreateDeck}
          wizardSchool={wizardSchool}
          wizardLevel={wizardLevel}
          weavingClass={weavingClass}
        />

        <NewDeckModal
          showModal={showNewDeckModal}
          setShowModal={setShowNewDeckModal}
          // onCreateDeck={onCreateDeck}
          triggerButton={
            <Button variant="outline_primary" className="md:ml-4">
              New Deck
            </Button>
          }
        />
      </div>

      <HeaderActions
        currentDeck={currentDeck}
        onToggleRightSidebar={onToggleRightSidebar}
      />
    </header>
  );
}
