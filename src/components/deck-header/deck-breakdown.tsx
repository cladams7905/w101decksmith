"use client"
import { Edit, Trash2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Deck, Spell } from "@/lib/types"
import { useState } from "react"

interface DeckBreakdownProps {
  deck: Deck
  onSelectSpells: (typeId: string, actionType: "edit" | "delete", isSpellId?: boolean) => void
  onDeleteSpells: (typeId: string, isSpellId?: boolean) => void
}

export default function DeckBreakdown({ deck, onSelectSpells, onDeleteSpells }: DeckBreakdownProps) {
  // Track which school categories are expanded
  const [expandedSchools, setExpandedSchools] = useState<Record<string, boolean>>({})

  // Toggle expanded state for a school
  const toggleSchoolExpanded = (school: string) => {
    setExpandedSchools((prev) => ({
      ...prev,
      [school]: !prev[school],
    }))
  }

  // Calculate the breakdown of spells by school
  const getSchoolBreakdown = () => {
    const breakdown: Record<string, number> = {}

    deck.spells.forEach((spell) => {
      const school = spell.school
      breakdown[school] = (breakdown[school] || 0) + 1
    })

    // Sort by count (descending)
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([school, count]) => ({ school, count }))
  }

  // Get individual spell counts within each school
  const getSpellCounts = (school: string) => {
    const spellCounts: Record<string, { spell: Spell; count: number }> = {}

    deck.spells.forEach((spell) => {
      if (spell.school === school) {
        if (!spellCounts[spell.id]) {
          spellCounts[spell.id] = { spell, count: 0 }
        }
        spellCounts[spell.id].count += 1
      }
    })

    // Sort by count (descending), then by pip cost (ascending)
    return Object.values(spellCounts).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.spell.pips - b.spell.pips
    })
  }

  const schoolBreakdown = getSchoolBreakdown()

  // Get the color for a school
  const getSchoolColor = (school: string) => {
    const schoolColors: Record<string, string> = {
      fire: "red",
      ice: "blue",
      storm: "purple",
      life: "green",
      death: "gray",
      myth: "yellow",
      balance: "orange",
      astral: "purple",
      shadow: "gray",
    }
    return schoolColors[school] || "purple"
  }

  // Calculate the percentage of each school
  const calculatePercentage = (count: number) => {
    return deck.spells.length > 0 ? Math.round((count / deck.spells.length) * 100) : 0
  }

  return (
    <div className="py-2">
      <div className="px-3 py-1 font-medium text-sm">Deck Breakdown</div>
      <Separator className="my-1" />

      {deck.spells.length === 0 ? (
        <div className="px-3 py-4 text-center text-sm text-muted-foreground">No spells in deck</div>
      ) : (
        <div className="space-y-1 py-1">
          {schoolBreakdown.map(({ school, count }) => (
            <Collapsible
              key={school}
              open={expandedSchools[school]}
              onOpenChange={() => toggleSchoolExpanded(school)}
              className="transition-all"
            >
              <div className="px-3 py-1.5 flex items-center justify-between group hover:bg-accent/50 transition-colors">
                <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${expandedSchools[school] ? "rotate-90" : ""}`}
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${
                      school === "shadow" ? "bg-gray-900" : `bg-${getSchoolColor(school)}-500`
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-sm capitalize">{school}</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {count} ({calculatePercentage(count)}%)
                  </Badge>
                </CollapsibleTrigger>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectSpells(school, "edit")}>
                        Replace all {school} spells
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onSelectSpells(school, "delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <CollapsibleContent>
                <div className="pl-8 pr-3 space-y-1 py-1 border-l-2 border-blue-900/20 ml-3">
                  {getSpellCounts(school).map(({ spell, count }) => (
                    <div
                      key={spell.id}
                      className="flex items-center justify-between text-xs py-1 hover:bg-accent/30 px-2 rounded group/spell"
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]">{spell.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="bg-blue-900/20 hover:bg-blue-900/30">
                          ×{count}
                        </Badge>
                        <div className="flex items-center opacity-0 group-hover/spell:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectSpells(spell.id, "edit", true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectSpells(spell.id, "delete", true)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          <Separator className="my-1" />

          <div className="px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Total</span>
              <Badge variant="outline" className="ml-1">
                {deck.spells.length} / 64
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">{64 - deck.spells.length} slots available</div>
          </div>
        </div>
      )}
    </div>
  )
}
