import type { Spell } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/spell-tooltip";
import SpellUtilityBadge from "@/components/spell-utility-badge";

interface DeckGridSlotProps {
  spell: Spell | null;
  index: number;
  isSelected: boolean;
  onEmptySlotClick: (index: number, event: React.MouseEvent) => void;
  onFilledSlotClick: (index: number, event: React.MouseEvent) => void;
  onMouseDown: (index: number, event: React.MouseEvent) => void;
  onMouseEnter: (index: number) => void;
}

export function DeckGridSlot({
  spell,
  index,
  isSelected,
  onEmptySlotClick,
  onFilledSlotClick,
  onMouseDown,
  onMouseEnter
}: DeckGridSlotProps) {
  const handleClick = (event: React.MouseEvent) => {
    // Only trigger click if not part of a drag selection
    if (event.detail === 1) {
      // Single click
      if (spell) {
        onFilledSlotClick(index, event);
      } else {
        onEmptySlotClick(index, event);
      }
    }
  };

  const baseClasses = `aspect-square flex items-center justify-center transition-all duration-200 cursor-pointer ${
    isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
  }`;

  if (spell) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`${baseClasses} bg-purple-900/50 border-purple-700/50 hover:border-purple-500 group`}
            onClick={handleClick}
            onMouseDown={(e) => onMouseDown(index, e)}
            onMouseEnter={() => onMouseEnter(index)}
          >
            <CardContent className="p-1 h-full w-full flex flex-col items-center justify-center text-center relative">
              <div className="text-[10px] font-medium truncate w-full">
                {spell.name}
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <div className="text-[8px] text-muted-foreground">
                  {spell.pips}
                </div>
                <div className="scale-75 origin-left">
                  <SpellUtilityBadge spell={spell} size="sm" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-4 w-4 text-white" />
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="p-0 border-0 rounded-xl"
        >
          <SpellTooltip spell={spell} schoolColor={spell.school} />
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Card
      className={`${baseClasses} border-blue-900/30 bg-linear-to-br from-blue-900/40 hover:bg-gray-600/30 hover:border-gray-400/50 group`}
      onClick={handleClick}
      onMouseDown={(e) => onMouseDown(index, e)}
      onMouseEnter={() => onMouseEnter(index)}
    >
      <CardContent className="p-1 h-full w-full flex flex-col items-center justify-center text-center">
        <Plus className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-[8px] text-muted-foreground">•</div>
      </CardContent>
    </Card>
  );
}
