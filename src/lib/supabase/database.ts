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
      drafts: {
        Row: {
          authorId: string | null
          contentHtml: string | null
          contentJson: Json | null
          contributors: string[] | null
          createdAt: string
          documentId: string
          id: number
          updatedAt: string | null
          yDoc: string | null
        }
        Insert: {
          authorId?: string | null
          contentHtml?: string | null
          contentJson?: Json | null
          contributors?: string[] | null
          createdAt?: string
          documentId?: string
          id?: number
          updatedAt?: string | null
          yDoc?: string | null
        }
        Update: {
          authorId?: string | null
          contentHtml?: string | null
          contentJson?: Json | null
          contributors?: string[] | null
          createdAt?: string
          documentId?: string
          id?: number
          updatedAt?: string | null
          yDoc?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          createdAt: string
          id: number
          resolvedAt: string | null
          screenshot: string | null
          status: string | null
          text: string
          type: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          id?: number
          resolvedAt?: string | null
          screenshot?: string | null
          status?: string | null
          text: string
          type: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          id?: number
          resolvedAt?: string | null
          screenshot?: string | null
          status?: string | null
          text?: string
          type?: string
          userId?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          createdAt: string
          handle: string | null
          isAnonymous: boolean
          metadata: Json | null
          name: string | null
          profileId: string
          updatedAt: string
        }
        Insert: {
          address?: string | null
          createdAt?: string
          handle?: string | null
          isAnonymous?: boolean
          metadata?: Json | null
          name?: string | null
          profileId: string
          updatedAt?: string
        }
        Update: {
          address?: string | null
          createdAt?: string
          handle?: string | null
          isAnonymous?: boolean
          metadata?: Json | null
          name?: string | null
          profileId?: string
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
