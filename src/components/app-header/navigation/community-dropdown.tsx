import { useState } from "react";
import {
  ChevronRight,
  Users,
  TrendingUp,
  Search,
  Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function CommunityDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        asChild
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Button variant="ghost" className="hidden md:flex">
          Community
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[700px]"
        align="start"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
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
                <Badge variant="outline" className="bg-red-900/30 text-red-100">
                  Fire
                </Badge>
              </div>
              <div className="flex items-center justify-between p-1 rounded hover:bg-accent cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs">
                    I
                  </div>
                  <div>
                    <div className="text-sm font-medium">Ice Tank Build</div>
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
  );
}
