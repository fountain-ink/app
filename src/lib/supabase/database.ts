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
      blogs: {
        Row: {
          about: string | null
          address: string
          created_at: string
          handle: string | null
          icon: string | null
          metadata: Json
          owner: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          about?: string | null
          address: string
          created_at?: string
          handle?: string | null
          icon?: string | null
          metadata?: Json
          owner: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          about?: string | null
          address?: string
          created_at?: string
          handle?: string | null
          icon?: string | null
          metadata?: Json
          owner?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["address"]
          },
        ]
      }
      drafts: {
        Row: {
          author: string | null
          contentHtml: string | null
          contentJson: Json | null
          contentMarkdown: string | null
          contributors: string[] | null
          coverUrl: string | null
          createdAt: string
          documentId: string
          id: number
          subtitle: string | null
          tags: string[] | null
          title: string
          updatedAt: string | null
          yDoc: string | null
        }
        Insert: {
          author?: string | null
          contentHtml?: string | null
          contentJson?: Json | null
          contentMarkdown?: string | null
          contributors?: string[] | null
          coverUrl?: string | null
          createdAt?: string
          documentId?: string
          id?: number
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updatedAt?: string | null
          yDoc?: string | null
        }
        Update: {
          author?: string | null
          contentHtml?: string | null
          contentJson?: Json | null
          contentMarkdown?: string | null
          contributors?: string[] | null
          coverUrl?: string | null
          createdAt?: string
          documentId?: string
          id?: number
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updatedAt?: string | null
          yDoc?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          author: string | null
          createdAt: string
          id: number
          resolvedAt: string | null
          screenshot: string | null
          status: string | null
          text: string
          type: string
        }
        Insert: {
          author?: string | null
          createdAt?: string
          id?: number
          resolvedAt?: string | null
          screenshot?: string | null
          status?: string | null
          text: string
          type: string
        }
        Update: {
          author?: string | null
          createdAt?: string
          id?: number
          resolvedAt?: string | null
          screenshot?: string | null
          status?: string | null
          text?: string
          type?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          createdAt: string
          email: string | null
          handle: string | null
          isAnonymous: boolean
          metadata: Json | null
          name: string | null
          owner: string | null
          settings: Json
          updatedAt: string
        }
        Insert: {
          address: string
          createdAt?: string
          email?: string | null
          handle?: string | null
          isAnonymous?: boolean
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          settings?: Json
          updatedAt?: string
        }
        Update: {
          address?: string
          createdAt?: string
          email?: string | null
          handle?: string | null
          isAnonymous?: boolean
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          settings?: Json
          updatedAt?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
