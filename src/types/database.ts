export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          created_at: string
          user_name: string | null
          birth_date: string | null
          birth_time: string | null
          gender: string | null
          status: 'GATHERING_INFO' | 'ANALYZING' | 'READY'
        }
        Insert: {
          id?: string
          created_at?: string
          user_name?: string | null
          birth_date?: string | null
          birth_time?: string | null
          gender?: string | null
          status?: 'GATHERING_INFO' | 'ANALYZING' | 'READY'
        }
        Update: {
          id?: string
          created_at?: string
          user_name?: string | null
          birth_date?: string | null
          birth_time?: string | null
          gender?: string | null
          status?: 'GATHERING_INFO' | 'ANALYZING' | 'READY'
        }
      }
      messages: {
        Row: {
          id: number
          created_at: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          phase: 'GATHERING_INFO' | 'ANALYZING' | 'READY'
        }
        Insert: {
          id?: number
          created_at?: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          phase?: 'GATHERING_INFO' | 'ANALYZING' | 'READY'
        }
        Update: {
          id?: number
          created_at?: string
          session_id?: string
          role?: 'user' | 'assistant'
          content?: string
          phase?: 'GATHERING_INFO' | 'ANALYZING' | 'READY'
        }
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
  }
}

export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']