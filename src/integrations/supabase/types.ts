export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      lawyers: {
        Row: {
          allocation_date: string | null
          allocation_month: string
          allocation_month_num: number | null
          allocation_status: string | null
          allocation_status_encoded: number | null
          avg_tat_days: number | null
          blacklist_status: boolean | null
          branch_id: string | null
          branch_name: string
          case_id: string | null
          cases_assigned: number | null
          cases_completed: number | null
          cases_remaining: number | null
          client_feedback_score: number | null
          complaint_count: number | null
          complaints_per_case: number | null
          completion_rate: number | null
          created_at: string
          feedback_flag: string | null
          feedback_flag_encoded: number | null
          id: string
          lawyer_id: string
          lawyer_name: string | null
          lawyer_score: number | null
          low_performance_flag: boolean | null
          max_capacity: number | null
          performance_score: number | null
          quality_check_flag: string | null
          quality_check_flag_encoded: number | null
          quality_flags: number | null
          quality_rating: string | null
          rework_count: number | null
          reworks_per_case: number | null
          tat_bucket: string | null
          tat_compliance_percent: number | null
          tat_flag: string | null
          tat_flag_encoded: number | null
          total_cases_ytd: number | null
          updated_at: string
        }
        Insert: {
          allocation_date?: string | null
          allocation_month: string
          allocation_month_num?: number | null
          allocation_status?: string | null
          allocation_status_encoded?: number | null
          avg_tat_days?: number | null
          blacklist_status?: boolean | null
          branch_id?: string | null
          branch_name: string
          case_id?: string | null
          cases_assigned?: number | null
          cases_completed?: number | null
          cases_remaining?: number | null
          client_feedback_score?: number | null
          complaint_count?: number | null
          complaints_per_case?: number | null
          completion_rate?: number | null
          created_at?: string
          feedback_flag?: string | null
          feedback_flag_encoded?: number | null
          id?: string
          lawyer_id: string
          lawyer_name?: string | null
          lawyer_score?: number | null
          low_performance_flag?: boolean | null
          max_capacity?: number | null
          performance_score?: number | null
          quality_check_flag?: string | null
          quality_check_flag_encoded?: number | null
          quality_flags?: number | null
          quality_rating?: string | null
          rework_count?: number | null
          reworks_per_case?: number | null
          tat_bucket?: string | null
          tat_compliance_percent?: number | null
          tat_flag?: string | null
          tat_flag_encoded?: number | null
          total_cases_ytd?: number | null
          updated_at?: string
        }
        Update: {
          allocation_date?: string | null
          allocation_month?: string
          allocation_month_num?: number | null
          allocation_status?: string | null
          allocation_status_encoded?: number | null
          avg_tat_days?: number | null
          blacklist_status?: boolean | null
          branch_id?: string | null
          branch_name?: string
          case_id?: string | null
          cases_assigned?: number | null
          cases_completed?: number | null
          cases_remaining?: number | null
          client_feedback_score?: number | null
          complaint_count?: number | null
          complaints_per_case?: number | null
          completion_rate?: number | null
          created_at?: string
          feedback_flag?: string | null
          feedback_flag_encoded?: number | null
          id?: string
          lawyer_id?: string
          lawyer_name?: string | null
          lawyer_score?: number | null
          low_performance_flag?: boolean | null
          max_capacity?: number | null
          performance_score?: number | null
          quality_check_flag?: string | null
          quality_check_flag_encoded?: number | null
          quality_flags?: number | null
          quality_rating?: string | null
          rework_count?: number | null
          reworks_per_case?: number | null
          tat_bucket?: string | null
          tat_compliance_percent?: number | null
          tat_flag?: string | null
          tat_flag_encoded?: number | null
          total_cases_ytd?: number | null
          updated_at?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
