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
      jobs: {
        Row: {
          id: string
          created_at: string
          title: string
          company_name: string
          company_logo?: string
          location: string
          job_type: string
          salary_range?: string
          description: string
          requirements?: string[]
          responsibilities?: string[]
          status: 'active' | 'inactive' | 'archived'
          district?: string
          coordinates?: { latitude: number; longitude: number }
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          company_name: string
          company_logo?: string
          location: string
          job_type: string
          salary_range?: string
          description: string
          requirements?: string[]
          responsibilities?: string[]
          status?: 'active' | 'inactive' | 'archived'
          district?: string
          coordinates?: { latitude: number; longitude: number }
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          company_name?: string
          company_logo?: string
          location?: string
          job_type?: string
          salary_range?: string
          description?: string
          requirements?: string[]
          responsibilities?: string[]
          status?: 'active' | 'inactive' | 'archived'
          district?: string
          coordinates?: { latitude: number; longitude: number }
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email?: string
          phone?: string
          full_name?: string
          avatar_url?: string
          career?: string
          district?: string
          coordinates?: { latitude: number; longitude: number }
        }
        Insert: {
          id: string
          created_at?: string
          email?: string
          phone?: string
          full_name?: string
          avatar_url?: string
          career?: string
          district?: string
          coordinates?: { latitude: number; longitude: number }
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          phone?: string
          full_name?: string
          avatar_url?: string
          career?: string
          district?: string
          coordinates?: { latitude: number; longitude: number }
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