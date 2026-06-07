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
      lead_journey_stages: {
        Row: {
          completed_at: string | null
          created_at: string
          data: Json
          id: string
          lead_id: string
          notes: string | null
          stage: Database["public"]["Enums"]["journey_stage"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          lead_id: string
          notes?: string | null
          stage: Database["public"]["Enums"]["journey_stage"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          lead_id?: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["journey_stage"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_journey_stages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_properties: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          lead_id: string
          property_id: string
          proposal_value: number | null
          relation_status: Database["public"]["Enums"]["lead_property_status"]
          updated_at: string
          user_id: string
          visited_at: string | null
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          lead_id: string
          property_id: string
          proposal_value?: number | null
          relation_status?: Database["public"]["Enums"]["lead_property_status"]
          updated_at?: string
          user_id: string
          visited_at?: string | null
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          lead_id?: string
          property_id?: string
          proposal_value?: number | null
          relation_status?: Database["public"]["Enums"]["lead_property_status"]
          updated_at?: string
          user_id?: string
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_properties_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          last_contact_at: string | null
          notes: string | null
          origin: Database["public"]["Enums"]["lead_origin"]
          price_max: number | null
          price_min: number | null
          property_types: Database["public"]["Enums"]["property_type"][]
          region: string | null
          stage: Database["public"]["Enums"]["lead_stage"]
          tags: string[]
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          last_contact_at?: string | null
          notes?: string | null
          origin?: Database["public"]["Enums"]["lead_origin"]
          price_max?: number | null
          price_min?: number | null
          property_types?: Database["public"]["Enums"]["property_type"][]
          region?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          tags?: string[]
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          last_contact_at?: string | null
          notes?: string | null
          origin?: Database["public"]["Enums"]["lead_origin"]
          price_max?: number | null
          price_min?: number | null
          property_types?: Database["public"]["Enums"]["property_type"][]
          region?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          tags?: string[]
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          creci: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_m2: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          neighborhood: string | null
          parking_spots: number | null
          price: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          reference_code: string | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          neighborhood?: string | null
          parking_spots?: number | null
          price?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          reference_code?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          neighborhood?: string | null
          parking_spots?: number | null
          price?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          reference_code?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string
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
      journey_stage:
        | "primeiro_contato"
        | "descoberta_valor"
        | "capacidade_financeira"
        | "financiamento"
        | "permuta"
        | "visitas"
        | "proposta"
        | "negociacao"
        | "fechamento"
        | "pos_venda"
      lead_origin:
        | "portal"
        | "indicacao"
        | "redes_sociais"
        | "evento"
        | "outros"
      lead_property_status: "sugerido" | "visitado" | "proposta" | "descartado"
      lead_stage:
        | "primeiro_contato"
        | "descoberta_valor"
        | "capacidade_financeira"
        | "financiamento"
        | "permuta"
        | "visitas"
        | "proposta"
        | "negociacao"
        | "fechamento"
      property_status: "disponivel" | "reservado" | "vendido" | "inativo"
      property_type:
        | "apartamento"
        | "casa"
        | "cobertura"
        | "comercial"
        | "terreno"
        | "galpao"
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
      journey_stage: [
        "primeiro_contato",
        "descoberta_valor",
        "capacidade_financeira",
        "financiamento",
        "permuta",
        "visitas",
        "proposta",
        "negociacao",
        "fechamento",
        "pos_venda",
      ],
      lead_origin: ["portal", "indicacao", "redes_sociais", "evento", "outros"],
      lead_property_status: ["sugerido", "visitado", "proposta", "descartado"],
      lead_stage: [
        "primeiro_contato",
        "descoberta_valor",
        "capacidade_financeira",
        "financiamento",
        "permuta",
        "visitas",
        "proposta",
        "negociacao",
        "fechamento",
      ],
      property_status: ["disponivel", "reservado", "vendido", "inativo"],
      property_type: [
        "apartamento",
        "casa",
        "cobertura",
        "comercial",
        "terreno",
        "galpao",
      ],
    },
  },
} as const
