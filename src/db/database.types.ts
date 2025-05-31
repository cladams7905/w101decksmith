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
      decks: {
        Row: {
          can_comment: boolean
          created_at: string
          description: string | null
          id: number
          is_public: boolean
          is_pve: boolean
          level: number
          name: string
          school: Database["public"]["Enums"]["school"]
          spells: Json | null
          user_id: string
          weaving_school: Database["public"]["Enums"]["school"] | null
        }
        Insert: {
          can_comment?: boolean
          created_at?: string
          description?: string | null
          id?: number
          is_public?: boolean
          is_pve?: boolean
          level: number
          name: string
          school: Database["public"]["Enums"]["school"]
          spells?: Json | null
          user_id: string
          weaving_school?: Database["public"]["Enums"]["school"] | null
        }
        Update: {
          can_comment?: boolean
          created_at?: string
          description?: string | null
          id?: number
          is_public?: boolean
          is_pve?: boolean
          level?: number
          name?: string
          school?: Database["public"]["Enums"]["school"]
          spells?: Json | null
          user_id?: string
          weaving_school?: Database["public"]["Enums"]["school"] | null
        }
        Relationships: []
      }
      spells: {
        Row: {
          accuracy: number | null
          card_effects: Database["public"]["Enums"]["card_effect"][] | null
          card_image_url: string | null
          card_type: Database["public"]["Enums"]["card_type"] | null
          description: string | null
          last_updated: string
          name: string
          pip_cost: string | null
          pvp_level: number | null
          pvp_status: Database["public"]["Enums"]["pvp_status"] | null
          school: Database["public"]["Enums"]["school"] | null
          tier: string
          wiki_url: string | null
        }
        Insert: {
          accuracy?: number | null
          card_effects?: Database["public"]["Enums"]["card_effect"][] | null
          card_image_url?: string | null
          card_type?: Database["public"]["Enums"]["card_type"] | null
          description?: string | null
          last_updated?: string
          name: string
          pip_cost?: string | null
          pvp_level?: number | null
          pvp_status?: Database["public"]["Enums"]["pvp_status"] | null
          school?: Database["public"]["Enums"]["school"] | null
          tier?: string
          wiki_url?: string | null
        }
        Update: {
          accuracy?: number | null
          card_effects?: Database["public"]["Enums"]["card_effect"][] | null
          card_image_url?: string | null
          card_type?: Database["public"]["Enums"]["card_type"] | null
          description?: string | null
          last_updated?: string
          name?: string
          pip_cost?: string | null
          pvp_level?: number | null
          pvp_status?: Database["public"]["Enums"]["pvp_status"] | null
          school?: Database["public"]["Enums"]["school"] | null
          tier?: string
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
        | "damage"
        | "manipulation"
        | "steal"
        | "global"
        | "charm"
        | "ward"
        | "heal"
        | "aoe"
        | "aura"
        | "enchantment"
        | "shadow"
      card_type: "spell" | "treasure_card" | "item_card"
      pvp_status: "no_pvp" | "no_pve" | "level_restricted" | "unrestricted"
      school:
        | "fire"
        | "ice"
        | "storm"
        | "life"
        | "myth"
        | "death"
        | "balance"
        | "astral"
        | "shadow"
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
        "damage",
        "manipulation",
        "steal",
        "global",
        "charm",
        "ward",
        "heal",
        "aoe",
        "aura",
        "enchantment",
        "shadow",
      ],
      card_type: ["spell", "treasure_card", "item_card"],
      pvp_status: ["no_pvp", "no_pve", "level_restricted", "unrestricted"],
      school: [
        "fire",
        "ice",
        "storm",
        "life",
        "myth",
        "death",
        "balance",
        "astral",
        "shadow",
      ],
    },
  },
} as const
