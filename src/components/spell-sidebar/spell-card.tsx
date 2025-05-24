import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import SpellTooltip from "@/components/spell-tooltip";
import type { Spell } from "@/lib/types";

interface SpellCardProps {
  spell: Spell;
  schoolColor: string;
  onClick: (spell: Spell, event: React.MouseEvent) => void;
}

export function SpellCard({ spell, schoolColor, onClick }: SpellCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className="cursor-pointer hover:bg-accent hover:border-primary active:border-primary transition-colors spell-card"
          onClick={(e) => onClick(spell, e)}
        >
          <CardContent className="p-3 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium truncate">{spell.name}</div>
              <Badge
                variant="outline"
                className={`bg-${schoolColor}-900 text-${schoolColor}-100 ml-1 shrink-0`}
              >
                {spell.pips}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {spell.description}
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="start"
        className="p-0 border-0 rounded-xl"
      >
        <SpellTooltip spell={spell} schoolColor={schoolColor} />
      </TooltipContent>
    </Tooltip>
  );
}
