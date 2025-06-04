import { useState } from "react";
import { PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { NotificationMenu } from "@/components/app-header/header-actions/notification-menu";
import { ShareDeckModal } from "./share-deck-modal";
import UserMenuComponent from "@/components/app-header/header-actions/user-menu";
import type { Deck } from "@/lib/types";

interface HeaderActionsProps {
  currentDeck: Deck;
  onToggleRightSidebar: () => void;
}

export function HeaderActions({
  currentDeck,
  onToggleRightSidebar
}: HeaderActionsProps) {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
    onToggleRightSidebar();
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={rightSidebarOpen ? "secondary" : "ghost"}
            size="icon"
            className="hidden md:flex transition-colors"
            onClick={handleToggleSidebar}
            title={rightSidebarOpen ? "Close sidebar" : "Open sidebar"}
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
  );
}
