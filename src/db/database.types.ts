export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      spells: {
        Row: {
          accuracy: number | null
          card_effects: Database["public"]["Enums"]["card_effect"][] | null
          card_image_url: string | null
          card_type: Database["public"]["Enums"]["card_type"] | null
          description: string | null
          id: number
          last_updated: string
          name: string
          pip_cost: number | null
          pvp_level: number | null
          school: Database["public"]["Enums"]["school"] | null
          wiki_url: string | null
        }
        Insert: {
          accuracy?: number | null
          card_effects?: Database["public"]["Enums"]["card_effect"][] | null
          card_image_url?: string | null
          card_type?: Database["public"]["Enums"]["card_type"] | null
          description?: string | null
          id?: number
          last_updated?: string
          name: string
          pip_cost?: number | null
          pvp_level?: number | null
          school?: Database["public"]["Enums"]["school"] | null
          wiki_url?: string | null
        }
        Update: {
          accuracy?: number | null
          card_effects?: Database["public"]["Enums"]["card_effect"][] | null
          card_image_url?: string | null
          card_type?: Database["public"]["Enums"]["card_type"] | null
          description?: string | null
          id?: number
          last_updated?: string
          name?: string
          pip_cost?: number | null
          pvp_level?: number | null
          school?: Database["public"]["Enums"]["school"] | null
          wiki_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      card_effect:
        | "Damage"
        | "Manipulation"
        | "Steal"
        | "Global"
        | "Charm"
        | "Ward"
        | "Heal"
        | "AoE"
        | "Aura"
        | "Enchantment"
        | "Shadow"
      card_type: "Spell" | "TreasureCard" | "ItemCard"
      school:
        | "Fire"
        | "Ice"
        | "Storm"
        | "Life"
        | "Myth"
        | "Death"
        | "Balance"
        | "Astral"
        | "Shadow"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      card_effect: [
        "Damage",
        "Manipulation",
        "Steal",
        "Global",
        "Charm",
        "Ward",
        "Heal",
        "AoE",
        "Aura",
        "Enchantment",
        "Shadow",
      ],
      card_type: ["Spell", "TreasureCard", "ItemCard"],
      school: [
        "Fire",
        "Ice",
        "Storm",
        "Life",
        "Myth",
        "Death",
        "Balance",
        "Astral",
        "Shadow",
      ],
    },
  },
} as const
