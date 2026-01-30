/**
 * ============================================================================
 * DOCUMENT STORE CONTEXT - PREPARADO PARA SUPABASE
 * ============================================================================
 * 
 * Este contexto gerencia setores, pastas e documentos.
 * Conectado ao Supabase para persistência real.
 * 
 * NOTA: As tabelas devem ser criadas no banco antes de usar este sistema.
 * Veja BACKEND_SETUP.md para instruções completas.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Sector, Folder, Document } from '@/types';
import { supabase } from '@/integrations/supabase';
import { useAuth } from './AuthContext';

// Tipos internos para mapear do banco
interface DbSector {
  id: string;
  name: string;
  icon: string;
  color: string | null;
  created_at: string;
  created_by: string;
}

interface DbFolder {
  id: string;
  sector_id: string;
  parent_folder_id: string | null;
  name: string;
  created_at: string;
  created_by: string;
}

interface DbDocument {
  id: string;
  folder_id: string;
  sector_id: string;
  name: string;
  description: string | null;
  type: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  created_by: string;
}

interface DocumentStoreContextType {
  sectors: Sector[];
  folders: Folder[];
  documents: Document[];
  isLoading: boolean;
  
  // Sectors
  addSector: (sector: Omit<Sector, 'id' | 'createdAt'>) => Promise<Sector | null>;
  updateSector: (id: string, updates: Partial<Sector>) => Promise<void>;
  deleteSector: (id: string) => Promise<void>;
  getSectorDocumentCount: (sectorId: string) => number;
  
  // Folders
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => Promise<Folder | null>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  getFoldersByParent: (sectorId: string, parentFolderId?: string) => Folder[];
  getFolderDocumentCount: (folderId: string) => number;
  
  // Documents
  addDocument: (document: Omit<Document, 'id' | 'createdAt'>) => Promise<Document | null>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  getDocumentsByFolder: (folderId: string) => Document[];
  
  // Search
  search: (query: string) => { sectors: Sector[]; folders: Folder[]; documents: Document[] };
  
  // Refresh
  refreshData: () => Promise<void>;
}

const DocumentStoreContext = createContext<DocumentStoreContextType | undefined>(undefined);

export function DocumentStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // CARREGAMENTO INICIAL DE DADOS
  // ============================================================================
  
  const fetchSectors = useCallback(async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('name');
    
    if (!error && data) {
      const dbData = data as unknown as DbSector[];
      setSectors(dbData.map(s => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        color: s.color || undefined,
        createdAt: s.created_at,
      })));
    }
  }, []);

  const fetchFolders = useCallback(async () => {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name');
    
    if (!error && data) {
      const dbData = data as unknown as DbFolder[];
      setFolders(dbData.map(f => ({
        id: f.id,
        sectorId: f.sector_id,
        parentFolderId: f.parent_folder_id || undefined,
        name: f.name,
        createdAt: f.created_at,
      })));
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      const dbData = data as unknown as DbDocument[];
      
      // Para cada documento, gera a URL pública do storage
      const docsWithUrls = await Promise.all(
        dbData.map(async (doc) => {
          let fileUrl = '';
          if (doc.file_path) {
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(doc.file_path);
            fileUrl = urlData?.publicUrl || '';
          }
          
          return {
            id: doc.id,
            folderId: doc.folder_id,
            sectorId: doc.sector_id,
            name: doc.name,
            description: doc.description || undefined,
            type: doc.type as 'pdf' | 'image' | 'doc',
            fileUrl,
            fileName: doc.file_name,
            fileSize: doc.file_size,
            mimeType: doc.mime_type,
            createdAt: doc.created_at,
          };
        })
      );
      
      setDocuments(docsWithUrls);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSectors(), fetchFolders(), fetchDocuments()]);
    setIsLoading(false);
  }, [fetchSectors, fetchFolders, fetchDocuments]);

  // Carrega dados quando o usuário faz login
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setSectors([]);
      setFolders([]);
      setDocuments([]);
      setIsLoading(false);
    }
  }, [user, refreshData]);

  // ============================================================================
  // SETORES
  // ============================================================================
  
  const addSector = useCallback(async (sector: Omit<Sector, 'id' | 'createdAt'>): Promise<Sector | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('sectors')
      .insert({
        name: sector.name,
        icon: sector.icon,
        color: sector.color || null,
        created_by: user.id,
      } as never)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Erro ao criar setor:', error);
      return null;
    }
    
    const dbData = data as unknown as DbSector;
    const newSector: Sector = {
      id: dbData.id,
      name: dbData.name,
      icon: dbData.icon,
      color: dbData.color || undefined,
      createdAt: dbData.created_at,
    };
    
    setSectors(prev => [...prev, newSector]);
    return newSector;
  }, [user]);

  const updateSector = useCallback(async (id: string, updates: Partial<Sector>) => {
    const { error } = await supabase
      .from('sectors')
      .update({
        name: updates.name,
        icon: updates.icon,
        color: updates.color || null,
      } as never)
      .eq('id', id);
    
    if (!error) {
      setSectors(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  }, []);

  const deleteSector = useCallback(async (id: string) => {
    // Primeiro, deleta todos os documentos do setor no storage
    const docsToDelete = documents.filter(d => d.sectorId === id);
    for (const doc of docsToDelete) {
      if (doc.fileUrl) {
        // Extrai o path do storage
        const path = doc.fileUrl.split('/documents/')[1];
        if (path) {
          await supabase.storage.from('documents').remove([path]);
        }
      }
    }
    
    // Deleta o setor (cascade vai deletar folders e documents)
    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setSectors(prev => prev.filter(s => s.id !== id));
      setFolders(prev => prev.filter(f => f.sectorId !== id));
      setDocuments(prev => prev.filter(d => d.sectorId !== id));
    }
  }, [documents]);

  const getSectorDocumentCount = useCallback((sectorId: string): number => {
    return documents.filter(d => d.sectorId === sectorId).length;
  }, [documents]);

  // ============================================================================
  // PASTAS
  // ============================================================================
  
  const addFolder = useCallback(async (folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('folders')
      .insert({
        sector_id: folder.sectorId,
        parent_folder_id: folder.parentFolderId || null,
        name: folder.name,
        created_by: user.id,
      } as never)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Erro ao criar pasta:', error);
      return null;
    }
    
    const dbData = data as unknown as DbFolder;
    const newFolder: Folder = {
      id: dbData.id,
      sectorId: dbData.sector_id,
      parentFolderId: dbData.parent_folder_id || undefined,
      name: dbData.name,
      createdAt: dbData.created_at,
    };
    
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, [user]);

  const updateFolder = useCallback(async (id: string, updates: Partial<Folder>) => {
    const { error } = await supabase
      .from('folders')
      .update({
        name: updates.name,
      } as never)
      .eq('id', id);
    
    if (!error) {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    }
  }, []);

  const getAllNestedFolderIds = useCallback((folderId: string, allFolders: Folder[]): string[] => {
    const ids = [folderId];
    const childFolders = allFolders.filter(f => f.parentFolderId === folderId);
    childFolders.forEach(child => {
      ids.push(...getAllNestedFolderIds(child.id, allFolders));
    });
    return ids;
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    const folderIdsToDelete = getAllNestedFolderIds(id, folders);
    
    // Deleta documentos do storage
    const docsToDelete = documents.filter(d => folderIdsToDelete.includes(d.folderId));
    for (const doc of docsToDelete) {
      if (doc.fileUrl) {
        const path = doc.fileUrl.split('/documents/')[1];
        if (path) {
          await supabase.storage.from('documents').remove([path]);
        }
      }
    }
    
    // Deleta a pasta (cascade vai deletar subpastas e documentos)
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setFolders(prev => prev.filter(f => !folderIdsToDelete.includes(f.id)));
      setDocuments(prev => prev.filter(d => !folderIdsToDelete.includes(d.folderId)));
    }
  }, [folders, documents, getAllNestedFolderIds]);

  const getFoldersByParent = useCallback((sectorId: string, parentFolderId?: string): Folder[] => {
    return folders.filter(f => 
      f.sectorId === sectorId && f.parentFolderId === parentFolderId
    );
  }, [folders]);

  const getFolderDocumentCount = useCallback((folderId: string): number => {
    return documents.filter(d => d.folderId === folderId).length;
  }, [documents]);

  // ============================================================================
  // DOCUMENTOS
  // ============================================================================
  
  const addDocument = useCallback(async (document: Omit<Document, 'id' | 'createdAt'>): Promise<Document | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('documents')
      .insert({
        folder_id: document.folderId,
        sector_id: document.sectorId,
        name: document.name,
        description: document.description || null,
        type: document.type,
        file_path: document.fileUrl, // Aqui o fileUrl é o path no storage
        file_name: document.fileName,
        file_size: document.fileSize,
        mime_type: document.mimeType,
        created_by: user.id,
      } as never)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Erro ao criar documento:', error);
      return null;
    }
    
    const dbData = data as unknown as DbDocument;
    
    // Gera URL pública
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(dbData.file_path);
    
    const newDocument: Document = {
      id: dbData.id,
      folderId: dbData.folder_id,
      sectorId: dbData.sector_id,
      name: dbData.name,
      description: dbData.description || undefined,
      type: dbData.type as 'pdf' | 'image' | 'doc',
      fileUrl: urlData?.publicUrl || '',
      fileName: dbData.file_name,
      fileSize: dbData.file_size,
      mimeType: dbData.mime_type,
      createdAt: dbData.created_at,
    };
    
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  }, [user]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    const { error } = await supabase
      .from('documents')
      .update({
        name: updates.name,
        description: updates.description || null,
      } as never)
      .eq('id', id);
    
    if (!error) {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    const docToDelete = documents.find(d => d.id === id);
    
    if (docToDelete?.fileUrl) {
      // Remove do storage
      const path = docToDelete.fileUrl.split('/documents/')[1];
      if (path) {
        await supabase.storage.from('documents').remove([path]);
      }
    }
    
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  }, [documents]);

  const getDocumentsByFolder = useCallback((folderId: string): Document[] => {
    return documents.filter(d => d.folderId === folderId);
  }, [documents]);

  // ============================================================================
  // BUSCA
  // ============================================================================
  
  const search = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return {
      sectors: sectors.filter(s => s.name.toLowerCase().includes(lowerQuery)),
      folders: folders.filter(f => f.name.toLowerCase().includes(lowerQuery)),
      documents: documents.filter(d => 
        d.name.toLowerCase().includes(lowerQuery) || 
        d.description?.toLowerCase().includes(lowerQuery)
      ),
    };
  }, [sectors, folders, documents]);

  // ============================================================================
  // PROVIDER
  // ============================================================================
  
  const value: DocumentStoreContextType = {
    sectors,
    folders,
    documents,
    isLoading,
    addSector,
    updateSector,
    deleteSector,
    getSectorDocumentCount,
    addFolder,
    updateFolder,
    deleteFolder,
    getFoldersByParent,
    getFolderDocumentCount,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByFolder,
    search,
    refreshData,
  };

  return (
    <DocumentStoreContext.Provider value={value}>
      {children}
    </DocumentStoreContext.Provider>
  );
}

export function useDocumentStore() {
  const context = useContext(DocumentStoreContext);
  if (context === undefined) {
    throw new Error('useDocumentStore must be used within a DocumentStoreProvider');
  }
  return context;
}
