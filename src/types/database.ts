export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          slug: string
          display_name: string
          niche: string
          brand: Json
          custom_domain: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          display_name: string
          niche?: string
          brand?: Json
          custom_domain?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          display_name?: string
          niche?: string
          brand?: Json
          custom_domain?: string | null
          created_at?: string
        }
      }
      units: {
        Row: {
          id: string
          tenant_id: string
          slug: string
          display_name: string
          sort_order: number
        }
        Insert: {
          id?: string
          tenant_id: string
          slug: string
          display_name: string
          sort_order?: number
        }
        Update: {
          id?: string
          tenant_id?: string
          slug?: string
          display_name?: string
          sort_order?: number
        }
      }
      daily_entries: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          date: string
          covers: number | null
          lotacao: string | null
          obs: string | null
          created_by: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          unit_id: string
          date: string
          covers?: number | null
          lotacao?: string | null
          obs?: string | null
          created_by?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          unit_id?: string
          date?: string
          covers?: number | null
          lotacao?: string | null
          obs?: string | null
          created_by?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      diary_entries: {
        Row: {
          id: string
          tenant_id: string
          ts: string
          author_name: string
          author_user_id: string | null
          tag: string
          texto: string
        }
        Insert: {
          id?: string
          tenant_id: string
          ts?: string
          author_name: string
          author_user_id?: string | null
          tag?: string
          texto: string
        }
        Update: {
          id?: string
          tenant_id?: string
          ts?: string
          author_name?: string
          author_user_id?: string | null
          tag?: string
          texto?: string
        }
      }
      roi_config: {
        Row: {
          tenant_id: string
          trafego: number
          mao_de_obra: number
          mkt_geral: number
          mode: string
          updated_at: string
        }
        Insert: {
          tenant_id: string
          trafego?: number
          mao_de_obra?: number
          mkt_geral?: number
          mode?: string
          updated_at?: string
        }
        Update: {
          tenant_id?: string
          trafego?: number
          mao_de_obra?: number
          mkt_geral?: number
          mode?: string
          updated_at?: string
        }
      }
      organic_entries: {
        Row: {
          tenant_id: string
          date: string
          posts: number
          stories: number
          reels: number
          alcance: number
          engajamento: number
        }
        Insert: {
          tenant_id: string
          date: string
          posts?: number
          stories?: number
          reels?: number
          alcance?: number
          engajamento?: number
        }
        Update: {
          tenant_id?: string
          date?: string
          posts?: number
          stories?: number
          reels?: number
          alcance?: number
          engajamento?: number
        }
      }
      ads_imports: {
        Row: {
          id: string
          tenant_id: string
          imported_at: string
          filename: string | null
          rows: Json
          date_range_start: string | null
          date_range_end: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          imported_at?: string
          filename?: string | null
          rows: Json
          date_range_start?: string | null
          date_range_end?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          imported_at?: string
          filename?: string | null
          rows?: Json
          date_range_start?: string | null
          date_range_end?: string | null
        }
      }
      data_sources: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string | null
          kind: string
          label: string | null
          url: string | null
          config: Json
        }
        Insert: {
          id?: string
          tenant_id: string
          unit_id?: string | null
          kind: string
          label?: string | null
          url?: string | null
          config?: Json
        }
        Update: {
          id?: string
          tenant_id?: string
          unit_id?: string | null
          kind?: string
          label?: string | null
          url?: string | null
          config?: Json
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
