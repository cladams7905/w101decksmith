"use client";

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import type React from "react";

import {
  Menu,
  PanelRight,
  Plus,
  Newspaper,
  TrendingUp,
  Search,
  Users,
  ChevronRight
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationMenu } from "@/components/notification-menu";
import { NewDeckModal } from "@/components/new-deck-modal";
import type { Deck } from "@/lib/types";
import { UpgradeMembershipModal } from "@/components/upgrade-membership-modal";
import UserMenuComponent from "@/components/user-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { MyDecksDropdown } from "@/components/my-decks-dropdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { ShareDeckModal } from "@/components/share-deck-modal";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface AppHeaderProps {
  currentDeck: Deck;
  decks: Deck[];
  onSwitchDeck: (deck: Deck) => void;
  onCreateDeck: (
    name: string,
    school: string,
    level: string,
    weavingClass: string
  ) => void;
  onToggleRightSidebar: () => void;
  renderSidebarContent: () => React.ReactNode;
  showNewDeckModal: boolean;
  setShowNewDeckModal: (show: boolean) => void;
  showDeckSwitchModal: boolean;
  setShowDeckSwitchModal: (show: boolean) => void;
  wizardSchool: string;
  wizardLevel: string;
  weavingClass: string;
}

export function AppHeader({
  currentDeck,
  decks,
  onSwitchDeck,
  onCreateDeck,
  onToggleRightSidebar,
  renderSidebarContent,
  showNewDeckModal,
  setShowNewDeckModal,
  showDeckSwitchModal,
  setShowDeckSwitchModal,
  wizardSchool,
  wizardLevel,
  weavingClass
}: AppHeaderProps) {
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b gradient-special backdrop-blur supports-[backdrop-filter]:bg-opacity-80 flex items-center px-4 sticky top-0 z-50">
      <div className="flex items-center">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden mr-2">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] p-0 gradient-linear flex flex-col"
          >
            <div className="flex-1 overflow-auto">{renderSidebarContent()}</div>
            <div className="border-t gradient-special p-4 sticky bottom-0">
              <div onClick={(e) => e.stopPropagation()}>
                <UpgradeMembershipModal />
              </div>
              <div className="text-xs text-muted-foreground text-center mt-2">
                Wizard101 Deck Builder
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* App Logo Placeholder */}
        <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold mr-4">
          W
        </div>

        {/* Community Dropdown */}
        <DropdownMenu
          open={communityDropdownOpen}
          onOpenChange={setCommunityDropdownOpen}
        >
          <DropdownMenuTrigger
            asChild
            onMouseEnter={() => setCommunityDropdownOpen(true)}
            onMouseLeave={() => setCommunityDropdownOpen(false)}
          >
            <Button variant="ghost" className="mr-2 hidden md:flex">
              Community
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[700px]"
            align="start"
            onMouseEnter={() => setCommunityDropdownOpen(true)}
            onMouseLeave={() => setCommunityDropdownOpen(false)}
          >
            <DropdownMenuLabel>Wizard101 Community</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="grid grid-cols-3 gap-4 p-4">
              {/* News Section */}
              <div>
                <DropdownMenuLabel className="flex items-center mb-2">
                  <Newspaper className="h-4 w-4 mr-2 text-blue-400" />
                  Latest News
                </DropdownMenuLabel>
                <div className="space-y-2">
                  <Card className="bg-blue-950/30 hover:bg-blue-950/50 transition-colors cursor-pointer">
                    <CardContent className="p-2">
                      <div className="text-sm font-medium">
                        Spring Update: New Spells Coming!
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2 days ago
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-950/30 hover:bg-blue-950/50 transition-colors cursor-pointer">
                    <CardContent className="p-2">
                      <div className="text-sm font-medium">
                        PvP Tournament Schedule Released
                      </div>
                      <div className="text-xs text-muted-foreground">
                        5 days ago
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Trending Decks */}
              <div>
                <DropdownMenuLabel className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
                  Trending Decks
                </DropdownMenuLabel>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-1 rounded hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white text-xs">
                        F
                      </div>
                      <div>
                        <div className="text-sm font-medium">Fire PvP Meta</div>
                        <div className="text-xs text-muted-foreground">
                          by FireMaster
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-red-900/30 text-red-100"
                    >
                      Fire
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-1 rounded hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs">
                        I
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Ice Tank Build
                        </div>
                        <div className="text-xs text-muted-foreground">
                          by FrostWizard
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-blue-900/30 text-blue-100"
                    >
                      Ice
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Browse Decks */}
              <div>
                <DropdownMenuLabel className="flex items-center mb-2">
                  <Search className="h-4 w-4 mr-2 text-purple-400" />
                  Browse Decks
                </DropdownMenuLabel>
                <div className="grid grid-cols-2 gap-1">
                  <Button variant="outline" size="sm" className="justify-start">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    Fire
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    Ice
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    Storm
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    Life
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                    Death
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    Myth
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-muted-foreground"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Community Decks
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* My Decks Dropdown */}
        <MyDecksDropdown
          decks={decks}
          currentDeck={currentDeck}
          onSwitchDeck={onSwitchDeck}
          showNewDeckModal={showNewDeckModal}
          setShowNewDeckModal={setShowNewDeckModal}
          onCreateDeck={onCreateDeck}
          wizardSchool={wizardSchool}
          wizardLevel={wizardLevel}
          weavingClass={weavingClass}
        />

        {/* Add Deck Button */}
        <NewDeckModal
          showModal={showNewDeckModal}
          setShowModal={setShowNewDeckModal}
          onCreateDeck={onCreateDeck}
          triggerButton={
            <Button variant="outline_primary" className="md:ml-4">
              New
              <Plus />
            </Button>
          }
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentDeck.rightSidebarOpen ? "secondary" : "ghost"}
              size="icon"
              className="hidden md:flex transition-colors"
              onClick={onToggleRightSidebar}
              title={
                currentDeck.rightSidebarOpen ? "Close sidebar" : "Open sidebar"
              }
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle Sidebar</TooltipContent>
        </Tooltip>

        <ShareDeckModal deck={currentDeck} />

        <NotificationMenu />

        <UserMenuComponent profileImage="/wizard-avatar.png" />
      </div>
    </header>
  );
}
