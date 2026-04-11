export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      food_items: {
        Row: {
          ai_confidence: number | null
          carbs: number
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          fats: number
          id: string
          is_countable: boolean
          is_public: boolean
          kcal: number
          name: string
          protein: number
          serving_size: number | null
          serving_unit: string | null
          source: Database["public"]["Enums"]["food_source"]
        }
        Insert: {
          ai_confidence?: number | null
          carbs: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fats: number
          id?: string
          is_countable?: boolean
          is_public?: boolean
          kcal: number
          name: string
          protein: number
          serving_size?: number | null
          serving_unit?: string | null
          source?: Database["public"]["Enums"]["food_source"]
        }
        Update: {
          ai_confidence?: number | null
          carbs?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fats?: number
          id?: string
          is_countable?: boolean
          is_public?: boolean
          kcal?: number
          name?: string
          protein?: number
          serving_size?: number | null
          serving_unit?: string | null
          source?: Database["public"]["Enums"]["food_source"]
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          carbs_snapshot: number
          date_id: string
          fats_snapshot: number
          food_item_id: string
          id: string
          kcal_snapshot: number
          logged_at: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes: string | null
          protein_snapshot: number
          quantity: number
          user_id: string
        }
        Insert: {
          carbs_snapshot: number
          date_id: string
          fats_snapshot: number
          food_item_id: string
          id?: string
          kcal_snapshot: number
          logged_at?: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          protein_snapshot: number
          quantity?: number
          user_id: string
        }
        Update: {
          carbs_snapshot?: number
          date_id?: string
          fats_snapshot?: number
          food_item_id?: string
          id?: string
          kcal_snapshot?: number
          logged_at?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          protein_snapshot?: number
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          calorie_goal: number
          carbs_goal: number
          created_at: string
          display_name: string | null
          fats_goal: number
          id: string
          protein_goal: number
          updated_at: string
        }
        Insert: {
          calorie_goal?: number
          carbs_goal?: number
          created_at?: string
          display_name?: string | null
          fats_goal?: number
          id: string
          protein_goal?: number
          updated_at?: string
        }
        Update: {
          calorie_goal?: number
          carbs_goal?: number
          created_at?: string
          display_name?: string | null
          fats_goal?: number
          id?: string
          protein_goal?: number
          updated_at?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          date_id: string
          id: string
          logged_at: string | null
          user_id: string
        }
        Insert: {
          amount_ml?: number
          date_id: string
          id?: string
          logged_at?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          date_id?: string
          id?: string
          logged_at?: string | null
          user_id?: string
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
      food_source: "ai_scan" | "manual_search" | "system"
      meal_type: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      food_source: ["ai_scan", "manual_search", "system"],
      meal_type: ["BREAKFAST", "LUNCH", "DINNER", "SNACK"],
    },
  },
} as const
