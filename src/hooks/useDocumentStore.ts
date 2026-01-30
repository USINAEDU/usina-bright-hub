import { useLocalStorage } from './useLocalStorage';
import { Sector, Folder, Document } from '@/types';

const DEFAULT_SECTORS: Sector[] = [
  { id: '1', name: 'Geral', icon: 'Folder', createdAt: new Date().toISOString() },
  { id: '2', name: 'RH', icon: 'Users', createdAt: new Date().toISOString() },
  { id: '3', name: 'Financeiro', icon: 'DollarSign', createdAt: new Date().toISOString() },
  { id: '4', name: 'Marketing', icon: 'Megaphone', createdAt: new Date().toISOString() },
  { id: '5', name: 'TI', icon: 'Monitor', createdAt: new Date().toISOString() },
];

export function useDocumentStore() {
  const [sectors, setSectors] = useLocalStorage<Sector[]>('usina_docs_sectors', DEFAULT_SECTORS);
  const [folders, setFolders] = useLocalStorage<Folder[]>('usina_docs_folders', []);
  const [documents, setDocuments] = useLocalStorage<Document[]>('usina_docs_documents', []);

  // Sectors
  const addSector = (sector: Omit<Sector, 'id' | 'createdAt'>) => {
    const newSector: Sector = {
      ...sector,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSectors(prev => [...prev, newSector]);
    return newSector;
  };

  const updateSector = (id: string, updates: Partial<Sector>) => {
    setSectors(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSector = (id: string) => {
    setSectors(prev => prev.filter(s => s.id !== id));
    setFolders(prev => prev.filter(f => f.sectorId !== id));
    setDocuments(prev => prev.filter(d => d.sectorId !== id));
  };

  const getSectorDocumentCount = (sectorId: string): number => {
    return documents.filter(d => d.sectorId === sectorId).length;
  };

  // Folders
  const addFolder = (folder: Omit<Folder, 'id' | 'createdAt'>) => {
    const newFolder: Folder = {
      ...folder,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFolder = (id: string) => {
    // Delete folder and all nested content
    const folderIdsToDelete = getAllNestedFolderIds(id);
    setFolders(prev => prev.filter(f => !folderIdsToDelete.includes(f.id)));
    setDocuments(prev => prev.filter(d => !folderIdsToDelete.includes(d.folderId)));
  };

  const getAllNestedFolderIds = (folderId: string): string[] => {
    const ids = [folderId];
    const childFolders = folders.filter(f => f.parentFolderId === folderId);
    childFolders.forEach(child => {
      ids.push(...getAllNestedFolderIds(child.id));
    });
    return ids;
  };

  const getFoldersByParent = (sectorId: string, parentFolderId?: string): Folder[] => {
    return folders.filter(f => 
      f.sectorId === sectorId && f.parentFolderId === parentFolderId
    );
  };

  const getFolderDocumentCount = (folderId: string): number => {
    return documents.filter(d => d.folderId === folderId).length;
  };

  // Documents
  const addDocument = (document: Omit<Document, 'id' | 'createdAt'>) => {
    const newDocument: Document = {
      ...document,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const getDocumentsByFolder = (folderId: string): Document[] => {
    return documents.filter(d => d.folderId === folderId);
  };

  // Search
  const search = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return {
      sectors: sectors.filter(s => s.name.toLowerCase().includes(lowerQuery)),
      folders: folders.filter(f => f.name.toLowerCase().includes(lowerQuery)),
      documents: documents.filter(d => 
        d.name.toLowerCase().includes(lowerQuery) || 
        d.description?.toLowerCase().includes(lowerQuery)
      ),
    };
  };

  return {
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
}
