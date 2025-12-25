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
      blog_posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          institution_id: string | null
          is_published: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          is_published?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          is_published?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          mission: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          mission?: string | null
          name?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          mission?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          notes: string | null
          pdf_url: string | null
          resource_type: string | null
          sort_order: number | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          pdf_url?: string | null
          resource_type?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          pdf_url?: string | null
          resource_type?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          background_color: string | null
          card_color: string | null
          created_at: string | null
          font_family: string | null
          footer_text: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          nav_blog_label: string | null
          nav_contact_label: string | null
          nav_courses_label: string | null
          nav_home_label: string | null
          primary_color: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          card_color?: string | null
          created_at?: string | null
          font_family?: string | null
          footer_text?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          nav_blog_label?: string | null
          nav_contact_label?: string | null
          nav_courses_label?: string | null
          nav_home_label?: string | null
          primary_color?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          card_color?: string | null
          created_at?: string | null
          font_family?: string | null
          footer_text?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          nav_blog_label?: string | null
          nav_contact_label?: string | null
          nav_courses_label?: string | null
          nav_home_label?: string | null
          primary_color?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
