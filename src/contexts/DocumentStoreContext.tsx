import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Sector, Folder, Document } from '@/types';

const STORAGE_KEYS = {
  sectors: 'usina_docs_sectors',
  folders: 'usina_docs_folders',
  documents: 'usina_docs_documents',
};

const DEFAULT_SECTORS: Sector[] = [
  { id: '1', name: 'Geral', icon: 'Folder', createdAt: new Date().toISOString() },
  { id: '2', name: 'RH', icon: 'Users', createdAt: new Date().toISOString() },
  { id: '3', name: 'Financeiro', icon: 'DollarSign', createdAt: new Date().toISOString() },
  { id: '4', name: 'Marketing', icon: 'Megaphone', createdAt: new Date().toISOString() },
  { id: '5', name: 'TI', icon: 'Monitor', createdAt: new Date().toISOString() },
];

interface DocumentStoreContextType {
  sectors: Sector[];
  folders: Folder[];
  documents: Document[];
  addSector: (sector: Omit<Sector, 'id' | 'createdAt'>) => Sector;
  updateSector: (id: string, updates: Partial<Sector>) => void;
  deleteSector: (id: string) => void;
  getSectorDocumentCount: (sectorId: string) => number;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  getFoldersByParent: (sectorId: string, parentFolderId?: string) => Folder[];
  getFolderDocumentCount: (folderId: string) => number;
  addDocument: (document: Omit<Document, 'id' | 'createdAt'>) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getDocumentsByFolder: (folderId: string) => Document[];
  search: (query: string) => { sectors: Sector[]; folders: Folder[]; documents: Document[] };
}

const DocumentStoreContext = createContext<DocumentStoreContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    // For documents, strip out the fileUrl to avoid localStorage quota issues
    // fileUrl uses blob URLs which are session-only anyway
    let dataToSave = value;
    if (key === STORAGE_KEYS.documents && Array.isArray(value)) {
      dataToSave = (value as unknown as Document[]).map(doc => ({
        ...doc,
        fileUrl: '' // Don't persist blob URLs
      })) as unknown as T;
    }
    localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
}

export function DocumentStoreProvider({ children }: { children: ReactNode }) {
  const [sectors, setSectors] = useState<Sector[]>(() => 
    loadFromStorage(STORAGE_KEYS.sectors, DEFAULT_SECTORS)
  );
  const [folders, setFolders] = useState<Folder[]>(() => 
    loadFromStorage(STORAGE_KEYS.folders, [])
  );
  const [documents, setDocuments] = useState<Document[]>(() => 
    loadFromStorage(STORAGE_KEYS.documents, [])
  );

  // Persist to localStorage on changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.sectors, sectors);
  }, [sectors]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.folders, folders);
  }, [folders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.documents, documents);
  }, [documents]);

  // Sectors
  const addSector = useCallback((sector: Omit<Sector, 'id' | 'createdAt'>): Sector => {
    const newSector: Sector = {
      ...sector,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSectors(prev => [...prev, newSector]);
    return newSector;
  }, []);

  const updateSector = useCallback((id: string, updates: Partial<Sector>) => {
    setSectors(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSector = useCallback((id: string) => {
    setSectors(prev => prev.filter(s => s.id !== id));
    setFolders(prev => prev.filter(f => f.sectorId !== id));
    setDocuments(prev => prev.filter(d => d.sectorId !== id));
  }, []);

  const getSectorDocumentCount = useCallback((sectorId: string): number => {
    return documents.filter(d => d.sectorId === sectorId).length;
  }, [documents]);

  // Folders
  const addFolder = useCallback((folder: Omit<Folder, 'id' | 'createdAt'>): Folder => {
    const newFolder: Folder = {
      ...folder,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const getAllNestedFolderIds = useCallback((folderId: string, allFolders: Folder[]): string[] => {
    const ids = [folderId];
    const childFolders = allFolders.filter(f => f.parentFolderId === folderId);
    childFolders.forEach(child => {
      ids.push(...getAllNestedFolderIds(child.id, allFolders));
    });
    return ids;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => {
      const folderIdsToDelete = getAllNestedFolderIds(id, prev);
      setDocuments(docs => docs.filter(d => !folderIdsToDelete.includes(d.folderId)));
      return prev.filter(f => !folderIdsToDelete.includes(f.id));
    });
  }, [getAllNestedFolderIds]);

  const getFoldersByParent = useCallback((sectorId: string, parentFolderId?: string): Folder[] => {
    return folders.filter(f => 
      f.sectorId === sectorId && f.parentFolderId === parentFolderId
    );
  }, [folders]);

  const getFolderDocumentCount = useCallback((folderId: string): number => {
    return documents.filter(d => d.folderId === folderId).length;
  }, [documents]);

  // Documents
  const addDocument = useCallback((document: Omit<Document, 'id' | 'createdAt'>): Document => {
    const newDocument: Document = {
      ...document,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDocumentsByFolder = useCallback((folderId: string): Document[] => {
    return documents.filter(d => d.folderId === folderId);
  }, [documents]);

  // Search
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

  const value: DocumentStoreContextType = {
    sectors,
    folders,
    documents,
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
