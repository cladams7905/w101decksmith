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
import type { Deck } from "@/db/database.types";

interface HeaderActionsProps {
  isDeckPage: boolean;
  currentDeck?: Deck;
  onToggleRightSidebar?: () => void;
  rightSidebarOpen?: boolean;
}

export function HeaderActions({
  isDeckPage,
  currentDeck,
  onToggleRightSidebar,
  rightSidebarOpen = false
}: HeaderActionsProps) {
  const handleToggleSidebar = () => {
    onToggleRightSidebar?.();
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      {isDeckPage && onToggleRightSidebar && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={rightSidebarOpen ? "secondary" : "ghost"}
              size="icon"
              className="flex transition-colors"
              onClick={handleToggleSidebar}
              title={rightSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle Sidebar</TooltipContent>
        </Tooltip>
      )}

      {isDeckPage && currentDeck && <ShareDeckModal deck={currentDeck} />}
      <NotificationMenu />
      <UserMenuComponent profileImage="/wizard-avatar.png" />
    </div>
  );
}
