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
          source: Database['public']['Enums']['food_source']
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
          source?: Database['public']['Enums']['food_source']
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
          source?: Database['public']['Enums']['food_source']
        }
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
          meal_type: Database['public']['Enums']['meal_type']
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
          meal_type: Database['public']['Enums']['meal_type']
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
          meal_type?: Database['public']['Enums']['meal_type']
          notes?: string | null
          protein_snapshot?: number
          quantity?: number
          user_id?: string
        }
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
      }
    }
    Enums: {
      food_source: 'ai_scan' | 'manual_search' | 'system'
      meal_type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
    }
  }
}
