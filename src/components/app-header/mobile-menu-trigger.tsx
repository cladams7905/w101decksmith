import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SpellSidebar } from "@/components/spell-sidebar";
import type { Deck, Spell } from "@/lib/types";

interface MobileMenuTriggerProps {
  currentDeck: Deck;
  onAddSpell: (spell: Spell, quantity: number) => void;
}

export function MobileMenuTrigger({
  currentDeck,
  onAddSpell
}: MobileMenuTriggerProps) {
  return (
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
        <div className="flex-1 overflow-auto">
          <SpellSidebar currentDeck={currentDeck} onAddSpell={onAddSpell} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
