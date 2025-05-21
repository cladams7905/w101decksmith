export interface Spell {
  id: string
  name: string
  description: string
  pips: number
  school: string
  damage?: number
  utility?: boolean
  damageOverTime?: number
  buffPercentage?: number
  debuffPercentage?: number
  healing?: number
  healingOverTime?: number
  pipsGained?: number
}

export interface SpellCategory {
  id: string
  name: string
  color: string
  spells: Spell[]
}

// Update the Deck interface to include rightSidebarOpen
export interface Deck {
  id: string
  name: string
  spells: Spell[]
  school?: string
  level?: string
  weavingClass?: string
  rightSidebarOpen?: boolean
}

export interface UtilityMetrics {
  dpp: number // Damage Per Pip
  dot: number // Damage Over Time
  buff: number // Buff Utility
  debuff: number // Debuff Utility
  hpp: number // Healing Per Pip
  hot: number // Healing Over Time
  pip: number // Pip Utility
}
