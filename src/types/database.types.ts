export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      grids: {
        Row: {
          id: string;
          user_id: string;
          main_goal: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          main_goal: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          main_goal?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pillars: {
        Row: {
          id: string;
          grid_id: string;
          name: string;
          description: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          grid_id: string;
          name: string;
          description?: string | null;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          grid_id?: string;
          name?: string;
          description?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          pillar_id: string;
          name: string;
          description: string | null;
          tracking_type: 'boolean' | 'numeric';
          unit: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pillar_id: string;
          name: string;
          description?: string | null;
          tracking_type: 'boolean' | 'numeric';
          unit?: string | null;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pillar_id?: string;
          name?: string;
          description?: string | null;
          tracking_type?: 'boolean' | 'numeric';
          unit?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      logs: {
        Row: {
          id: string;
          task_id: string;
          value: number;
          notes: string | null;
          logged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          value: number;
          notes?: string | null;
          logged_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          value?: number;
          notes?: string | null;
          logged_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

