"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Spell, Deck } from "@/lib/types"
import { spellCategories } from "@/lib/data"

interface BulkActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSpellType: string | null
  isSpellId: boolean
  actionType: "edit" | "delete"
  currentDeck: Deck
  onBulkReplaceSpell: (spell: Spell) => void
  onDeleteSpellsByType: (typeId: string, isSpellId?: boolean) => void
}

export function BulkActionDialog({
  open,
  onOpenChange,
  selectedSpellType,
  isSpellId,
  actionType,
  currentDeck,
  onBulkReplaceSpell,
  onDeleteSpellsByType,
}: BulkActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "edit" ? "Replace All" : "Delete All"}{" "}
            {isSpellId
              ? currentDeck.spells.find((s) => s.id === selectedSpellType)?.name || "Selected"
              : selectedSpellType?.charAt(0).toUpperCase() + selectedSpellType?.slice(1)}{" "}
            {isSpellId ? "Cards" : "Spells"}
          </DialogTitle>
        </DialogHeader>
        {actionType === "edit" ? (
          <div className="max-h-96 overflow-y-auto">
            <Accordion type="multiple" className="w-full">
              {spellCategories.map((category) => (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                      <span>{category.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-2 p-1">
                      {category.spells.map((spell) => (
                        <Card
                          key={spell.id}
                          className="cursor-pointer hover:bg-accent transition-colors spell-card"
                          onClick={() => onBulkReplaceSpell(spell)}
                        >
                          <CardContent className="p-3 flex flex-col">
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium truncate">{spell.name}</div>
                              <Badge
                                variant="outline"
                                className={`bg-${category.color}-900 text-${category.color}-100 ml-1 shrink-0`}
                              >
                                {spell.pips}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{spell.description}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p>
              Are you sure you want to delete all{" "}
              {isSpellId ? currentDeck.spells.find((s) => s.id === selectedSpellType)?.name : selectedSpellType}{" "}
              {isSpellId ? "cards" : "spells"} from your deck?
            </p>
            <p className="text-sm text-muted-foreground">
              This will remove{" "}
              {isSpellId
                ? currentDeck.spells.filter((spell) => spell.id === selectedSpellType).length
                : currentDeck.spells.filter((spell) => spell.school === selectedSpellType).length}{" "}
              cards from your deck.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedSpellType) onDeleteSpellsByType(selectedSpellType, isSpellId)
                  onOpenChange(false)
                }}
              >
                Delete All
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
