"use client";

import { Bell, Heart, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface NotificationItemProps {
  type: string;
  content: string;
  time: string;
  read: boolean;
}

export function NotificationItem({
  type,
  content,
  time,
  read
}: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className={`p-3 ${read ? "" : "bg-purple-900/10"}`}>
      <div className="flex gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="space-y-1">
          <p className="text-sm">{content}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}

export function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative mr-2">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground"
          >
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-auto">
          <NotificationItem
            type="like"
            content="IceWizard99 liked your Fire PvP Deck"
            time="5 minutes ago"
            read={false}
          />
          <NotificationItem
            type="comment"
            content="StormMaster: 'Great deck! I would add more shields though.'"
            time="2 hours ago"
            read={false}
          />
          <NotificationItem
            type="trending"
            content="Your 'Ice Tank Deck' is trending! 50+ views today."
            time="1 day ago"
            read={false}
          />
          <NotificationItem
            type="like"
            content="PyroWizard liked your Ice Tank Deck"
            time="2 days ago"
            read={true}
          />
          <NotificationItem
            type="comment"
            content="BalanceWiz: 'Nice strategy with the feints!'"
            time="3 days ago"
            read={true}
          />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center text-center text-sm text-muted-foreground">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
