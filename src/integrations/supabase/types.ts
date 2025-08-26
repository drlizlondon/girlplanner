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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          clarity_comment: string | null
          clarity_rating: number | null
          created_at: string | null
          engagement_comment: string | null
          engagement_rating: number | null
          id: string
          session_date: string | null
          session_title: string | null
          student_level: string | null
          teacher_id: string | null
          teaching_activity: string | null
        }
        Insert: {
          clarity_comment?: string | null
          clarity_rating?: number | null
          created_at?: string | null
          engagement_comment?: string | null
          engagement_rating?: number | null
          id?: string
          session_date?: string | null
          session_title?: string | null
          student_level?: string | null
          teacher_id?: string | null
          teaching_activity?: string | null
        }
        Update: {
          clarity_comment?: string | null
          clarity_rating?: number | null
          created_at?: string | null
          engagement_comment?: string | null
          engagement_rating?: number | null
          id?: string
          session_date?: string | null
          session_title?: string | null
          student_level?: string | null
          teacher_id?: string | null
          teaching_activity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          job_role: string | null
          photo_url: string | null
          qr_code: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_role?: string | null
          photo_url?: string | null
          qr_code?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_role?: string | null
          photo_url?: string | null
          qr_code?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      task_files: {
        Row: {
          content_type: string | null
          created_at: string | null
          file_path: string
          filename: string
          id: string
          size: number | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          file_path: string
          filename: string
          id?: string
          size?: number | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          file_path?: string
          filename?: string
          id?: string
          size?: number | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_types: {
        Row: {
          created_at: string | null
          id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          value?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          additional_info: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          priority: string
          thoughts: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          additional_info?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          thoughts?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          additional_info?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          thoughts?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "task_types"
            referencedColumns: ["value"]
          },
        ]
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
