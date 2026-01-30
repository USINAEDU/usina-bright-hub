/**
 * ============================================================================
 * SUPABASE INTEGRATION - PONTO DE ENTRADA
 * ============================================================================
 * 
 * Exporta o cliente e tipos do Supabase para uso em toda a aplicação.
 */

export { supabase } from './client';
export type {
  Database,
  Profile,
  DbSector,
  DbFolder,
  DbDocument,
  UserRole,
  AppRole,
} from './database.types';
