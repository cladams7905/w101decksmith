import type { Deck } from "@/db/database.types";
import { MobileNavigation } from "./mobile-navigation";
import { CommunityDropdown } from "./navigation/community-dropdown";
import { HeaderActions } from "./header-actions";
import { MyDecksDropdown } from "@/components/app-header/navigation/my-decks-dropdown";

import { Button } from "@/components/ui/button";
import DecksmithLogo from "@/../public/DeckSmith_Logo.svg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface AppHeaderProps {
  isDeckPage: boolean;
  currentDeck?: Deck;
  decks?: Deck[];
  onSwitchDeck?: (deck: Deck) => void;
  onToggleRightSidebar?: () => void;
  showNewDeckModal?: boolean;
  setShowNewDeckModal?: (show: boolean) => void;
  wizardSchool?: string;
  wizardLevel?: string;
  weavingClass?: string;
  rightSidebarOpen?: boolean;
}

export function AppHeader({
  isDeckPage,
  currentDeck,
  decks = [],
  onSwitchDeck,
  onToggleRightSidebar,
  showNewDeckModal = false,
  setShowNewDeckModal,
  wizardSchool = "",
  wizardLevel = "",
  weavingClass = "",
  rightSidebarOpen = false
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleCreateDeck = () => {
    // Navigate to the create page
    router.push("/create");
  };

  // Check if current page is active
  const isMyDecksActive = pathname === "/my-decks";
  const isCommunityActive =
    pathname?.startsWith("/decks") || pathname?.startsWith("/community");

  return (
    <header className="h-16 border-b bg-linear-to-br from-blue-900/40 backdrop-blur supports-[backdrop-filter]:bg-opacity-80 flex items-center px-6 sticky top-0 z-50">
      <div className="flex items-center">
        {/* Mobile Navigation - Hamburger Menu */}
        <MobileNavigation isDeckPage={isDeckPage} />

        {/* App Logo */}
        <Image
          src={DecksmithLogo}
          alt="DeckSmith"
          width={32}
          height={32}
          className="rounded-lg mr-4"
          priority
        />

        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="hidden md:flex items-center ml-4 gap-3">
          {/* 1. Create Deck Button (leftmost) */}
          <Button variant="outline_primary" onClick={handleCreateDeck}>
            Create Deck
          </Button>

          {/* 2. My Decks Button */}
          {isDeckPage &&
          decks.length > 0 &&
          onSwitchDeck &&
          setShowNewDeckModal ? (
            <MyDecksDropdown
              decks={decks}
              currentDeck={currentDeck!}
              onSwitchDeck={onSwitchDeck}
              showNewDeckModal={showNewDeckModal}
              setShowNewDeckModal={setShowNewDeckModal}
              wizardSchool={wizardSchool}
              wizardLevel={wizardLevel}
              weavingClass={weavingClass}
              isActive={isMyDecksActive}
            />
          ) : (
            <Link href="/my-decks">
              <Button
                variant="ghost"
                className={`ml-3 ${
                  isMyDecksActive ? "bg-secondary hover:bg-secondary/60" : ""
                }`}
              >
                My Decks
              </Button>
            </Link>
          )}

          {/* 3. Community Dropdown */}
          <CommunityDropdown isActive={isCommunityActive} />
        </div>
      </div>

      <HeaderActions
        isDeckPage={isDeckPage}
        currentDeck={currentDeck}
        onToggleRightSidebar={onToggleRightSidebar}
        rightSidebarOpen={rightSidebarOpen}
      />
    </header>
  );
}
