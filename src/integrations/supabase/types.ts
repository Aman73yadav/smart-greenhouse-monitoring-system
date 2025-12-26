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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      control_settings: {
        Row: {
          heating_enabled: boolean | null
          id: string
          irrigation_enabled: boolean | null
          lighting_enabled: boolean | null
          target_humidity: number | null
          target_soil_moisture: number | null
          target_temperature: number | null
          updated_at: string
          user_id: string
          ventilation_enabled: boolean | null
        }
        Insert: {
          heating_enabled?: boolean | null
          id?: string
          irrigation_enabled?: boolean | null
          lighting_enabled?: boolean | null
          target_humidity?: number | null
          target_soil_moisture?: number | null
          target_temperature?: number | null
          updated_at?: string
          user_id: string
          ventilation_enabled?: boolean | null
        }
        Update: {
          heating_enabled?: boolean | null
          id?: string
          irrigation_enabled?: boolean | null
          lighting_enabled?: boolean | null
          target_humidity?: number | null
          target_soil_moisture?: number | null
          target_temperature?: number | null
          updated_at?: string
          user_id?: string
          ventilation_enabled?: boolean | null
        }
        Relationships: []
      }
      iot_devices: {
        Row: {
          battery_level: number | null
          created_at: string
          device_name: string
          device_type: string
          firmware_version: string | null
          id: string
          last_seen: string | null
          status: string | null
          user_id: string
          zone: string | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string
          device_name: string
          device_type: string
          firmware_version?: string | null
          id?: string
          last_seen?: string | null
          status?: string | null
          user_id: string
          zone?: string | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string
          device_name?: string
          device_type?: string
          firmware_version?: string | null
          id?: string
          last_seen?: string | null
          status?: string | null
          user_id?: string
          zone?: string | null
        }
        Relationships: []
      }
      plants: {
        Row: {
          category: string
          created_at: string
          growth_stage: number | null
          health_status: string | null
          id: string
          image_url: string | null
          name: string
          planted_date: string
          species: string
          updated_at: string
          user_id: string
          zone: string | null
        }
        Insert: {
          category: string
          created_at?: string
          growth_stage?: number | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          name: string
          planted_date?: string
          species: string
          updated_at?: string
          user_id: string
          zone?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          growth_stage?: number | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          name?: string
          planted_date?: string
          species?: string
          updated_at?: string
          user_id?: string
          zone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          end_time: string | null
          id: string
          is_active: boolean | null
          name: string
          schedule_type: string
          start_time: string
          user_id: string
          zone: string | null
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          schedule_type: string
          start_time: string
          user_id: string
          zone?: string | null
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          schedule_type?: string
          start_time?: string
          user_id?: string
          zone?: string | null
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          co2_level: number | null
          device_id: string | null
          humidity: number | null
          id: string
          light_level: number | null
          recorded_at: string
          soil_moisture: number | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          co2_level?: number | null
          device_id?: string | null
          humidity?: number | null
          id?: string
          light_level?: number | null
          recorded_at?: string
          soil_moisture?: number | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          co2_level?: number | null
          device_id?: string | null
          humidity?: number | null
          id?: string
          light_level?: number | null
          recorded_at?: string
          soil_moisture?: number | null
          temperature?: number | null
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
