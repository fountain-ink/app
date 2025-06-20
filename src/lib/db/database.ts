export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      banlist: {
        Row: {
          added_by: string | null;
          address: string;
          created_at: string;
          reason: string | null;
        };
        Insert: {
          added_by?: string | null;
          address: string;
          created_at?: string;
          reason?: string | null;
        };
        Update: {
          added_by?: string | null;
          address?: string;
          created_at?: string;
          reason?: string | null;
        };
        Relationships: [];
      };
      blogs: {
        Row: {
          about: string | null;
          address: string;
          created_at: string;
          feed: string | null;
          handle: string | null;
          icon: string | null;
          mail_list_id: number | null;
          metadata: Json;
          owner: string;
          slug: string | null;
          theme: Json | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          about?: string | null;
          address: string;
          created_at?: string;
          feed?: string | null;
          handle?: string | null;
          icon?: string | null;
          mail_list_id?: number | null;
          metadata?: Json;
          owner: string;
          slug?: string | null;
          theme?: Json | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          about?: string | null;
          address?: string;
          created_at?: string;
          feed?: string | null;
          handle?: string | null;
          icon?: string | null;
          mail_list_id?: number | null;
          metadata?: Json;
          owner?: string;
          slug?: string | null;
          theme?: Json | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "blogs_owner_fkey";
            columns: ["owner"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["address"];
          },
        ];
      };
      chat_messages: {
        Row: {
          author: string;
          created_at: string;
          deleted_at: string | null;
          edited: boolean;
          id: number;
          message: string;
          metadata: Json | null;
          updated_at: string;
        };
        Insert: {
          author: string;
          created_at?: string;
          deleted_at?: string | null;
          edited?: boolean;
          id?: number;
          message: string;
          metadata?: Json | null;
          updated_at?: string;
        };
        Update: {
          author?: string;
          created_at?: string;
          deleted_at?: string | null;
          edited?: boolean;
          id?: number;
          message?: string;
          metadata?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contest_winners: {
        Row: {
          added_at: string;
          added_by: string;
          contest_id: string;
          id: number;
          place: number;
          post_slug: string;
          prize_amount: string | null;
          transaction_hash: string | null;
        };
        Insert: {
          added_at?: string;
          added_by: string;
          contest_id: string;
          id?: number;
          place: number;
          post_slug: string;
          prize_amount?: string | null;
          transaction_hash?: string | null;
        };
        Update: {
          added_at?: string;
          added_by?: string;
          contest_id?: string;
          id?: number;
          place?: number;
          post_slug?: string;
          prize_amount?: string | null;
          transaction_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contest_winners_contest_id_fkey";
            columns: ["contest_id"];
            isOneToOne: false;
            referencedRelation: "contests";
            referencedColumns: ["id"];
          },
        ];
      };
      contests: {
        Row: {
          created_at: string;
          created_by: string;
          end_date: string;
          id: string;
          name: string;
          prize_pool: Json | null;
          slug: string;
          start_date: string;
          status: string | null;
          theme: string | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          end_date: string;
          id?: string;
          name: string;
          prize_pool?: Json | null;
          slug: string;
          start_date: string;
          status?: string | null;
          theme?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          end_date?: string;
          id?: string;
          name?: string;
          prize_pool?: Json | null;
          slug?: string;
          start_date?: string;
          status?: string | null;
          theme?: string | null;
        };
        Relationships: [];
      };
      curated: {
        Row: {
          added_by: string | null;
          created_at: string;
          id: number;
          slug: string | null;
        };
        Insert: {
          added_by?: string | null;
          created_at?: string;
          id?: number;
          slug?: string | null;
        };
        Update: {
          added_by?: string | null;
          created_at?: string;
          id?: number;
          slug?: string | null;
        };
        Relationships: [];
      };
      drafts: {
        Row: {
          author: string | null;
          contentHtml: string | null;
          contentJson: Json | null;
          contentMarkdown: string | null;
          contributors: string[] | null;
          coverUrl: string | null;
          createdAt: string;
          documentId: string;
          id: number;
          published_id: string | null;
          subtitle: string | null;
          tags: string[] | null;
          title: string;
          updatedAt: string | null;
          yDoc: string | null;
        };
        Insert: {
          author?: string | null;
          contentHtml?: string | null;
          contentJson?: Json | null;
          contentMarkdown?: string | null;
          contributors?: string[] | null;
          coverUrl?: string | null;
          createdAt?: string;
          documentId?: string;
          id?: number;
          published_id?: string | null;
          subtitle?: string | null;
          tags?: string[] | null;
          title?: string;
          updatedAt?: string | null;
          yDoc?: string | null;
        };
        Update: {
          author?: string | null;
          contentHtml?: string | null;
          contentJson?: Json | null;
          contentMarkdown?: string | null;
          contributors?: string[] | null;
          coverUrl?: string | null;
          createdAt?: string;
          documentId?: string;
          id?: number;
          published_id?: string | null;
          subtitle?: string | null;
          tags?: string[] | null;
          title?: string;
          updatedAt?: string | null;
          yDoc?: string | null;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          author: string | null;
          createdAt: string;
          id: number;
          resolvedAt: string | null;
          screenshot: string | null;
          status: string | null;
          text: string;
          type: string;
        };
        Insert: {
          author?: string | null;
          createdAt?: string;
          id?: number;
          resolvedAt?: string | null;
          screenshot?: string | null;
          status?: string | null;
          text: string;
          type: string;
        };
        Update: {
          author?: string | null;
          createdAt?: string;
          id?: number;
          resolvedAt?: string | null;
          screenshot?: string | null;
          status?: string | null;
          text?: string;
          type?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          author: string | null;
          created_at: string;
          handle: string | null;
          id: string;
          lens_slug: string | null;
          slug: string | null;
        };
        Insert: {
          author?: string | null;
          created_at?: string;
          handle?: string | null;
          id: string;
          lens_slug?: string | null;
          slug?: string | null;
        };
        Update: {
          author?: string | null;
          created_at?: string;
          handle?: string | null;
          id?: string;
          lens_slug?: string | null;
          slug?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          address: string;
          createdAt: string;
          email: string | null;
          handle: string | null;
          isAnonymous: boolean;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          settings: Json;
          updatedAt: string;
        };
        Insert: {
          address: string;
          createdAt?: string;
          email?: string | null;
          handle?: string | null;
          isAnonymous?: boolean;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          settings?: Json;
          updatedAt?: string;
        };
        Update: {
          address?: string;
          createdAt?: string;
          email?: string | null;
          handle?: string | null;
          isAnonymous?: boolean;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          settings?: Json;
          updatedAt?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
