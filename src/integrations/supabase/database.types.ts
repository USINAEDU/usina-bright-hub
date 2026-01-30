/**
 * ============================================================================
 * TIPOS DO BANCO DE DADOS SUPABASE
 * ============================================================================
 * 
 * Este arquivo define os tipos TypeScript que correspondem às tabelas do banco.
 * O DEV BACKEND deve criar as tabelas conforme especificado aqui.
 * 
 * Após criar as tabelas, gere os tipos automaticamente com:
 * npx supabase gen types typescript --project-id decndldnjmuesytdpxib > src/integrations/supabase/database.types.ts
 */

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
      /**
       * TABELA: profiles
       * Armazena dados adicionais dos usuários autenticados
       */
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // Deve ser igual ao auth.users.id
          email: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };

      /**
       * TABELA: sectors
       * Setores/departamentos da organização
       */
      sectors: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          color?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          name?: string;
          icon?: string;
          color?: string | null;
        };
      };

      /**
       * TABELA: folders
       * Pastas dentro dos setores (suporta aninhamento)
       */
      folders: {
        Row: {
          id: string;
          sector_id: string;
          parent_folder_id: string | null;
          name: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          sector_id: string;
          parent_folder_id?: string | null;
          name: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          name?: string;
          parent_folder_id?: string | null;
        };
      };

      /**
       * TABELA: documents
       * Documentos/arquivos enviados
       */
      documents: {
        Row: {
          id: string;
          folder_id: string;
          sector_id: string;
          name: string;
          description: string | null;
          type: 'pdf' | 'image' | 'doc';
          file_path: string; // Caminho no Supabase Storage
          file_name: string;
          file_size: number;
          mime_type: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          folder_id: string;
          sector_id: string;
          name: string;
          description?: string | null;
          type: 'pdf' | 'image' | 'doc';
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };

      /**
       * TABELA: user_roles
       * Papéis dos usuários (admin, user, etc.)
       */
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'moderator' | 'user';
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'moderator' | 'user';
        };
        Update: {
          role?: 'admin' | 'moderator' | 'user';
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _user_id: string;
          _role: 'admin' | 'moderator' | 'user';
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'admin' | 'moderator' | 'user';
      document_type: 'pdf' | 'image' | 'doc';
    };
  };
}

// Tipos auxiliares para uso no frontend
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type DbSector = Database['public']['Tables']['sectors']['Row'];
export type DbFolder = Database['public']['Tables']['folders']['Row'];
export type DbDocument = Database['public']['Tables']['documents']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type AppRole = Database['public']['Enums']['app_role'];
