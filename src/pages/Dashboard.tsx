import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentStore } from '@/contexts/DocumentStoreContext';
import Sidebar from '@/components/Sidebar';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import ContentCard from '@/components/ContentCard';
import SectorDialog from '@/components/SectorDialog';
import FolderDialog from '@/components/FolderDialog';
import UploadDialog from '@/components/UploadDialog';
import DocumentDialog from '@/components/DocumentDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import DocumentViewer from '@/components/DocumentViewer';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Plus, FolderPlus, Upload, Pencil, Trash2, LayoutGrid, List } from 'lucide-react';
import { BreadcrumbItem, Folder, Document, Sector } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { toast } = useToast();
  const {
    sectors,
    addSector,
    updateSector,
    deleteSector,
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
  } = useDocumentStore();

  // State
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Dialogs
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [sectorDialogMode, setSectorDialogMode] = useState<'create' | 'edit'>('create');
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<'create' | 'edit'>('create');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'sector' | 'folder' | 'document'; id: string; name: string } | null>(null);

  // Current content
  const activeSector = sectors.find(s => s.id === activeSectorId);
  const currentFolders = useMemo(() => {
    if (!activeSectorId) return [];
    return getFoldersByParent(activeSectorId, currentFolderId);
  }, [activeSectorId, currentFolderId, getFoldersByParent]);

  const currentDocuments = useMemo(() => {
    if (!currentFolderId) return [];
    return getDocumentsByFolder(currentFolderId);
  }, [currentFolderId, getDocumentsByFolder]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return search(searchQuery);
  }, [searchQuery, search]);

  // Handlers
  const handleSectorSelect = (sectorId: string) => {
    setActiveSectorId(sectorId);
    setCurrentFolderId(undefined);
    const sector = sectors.find(s => s.id === sectorId);
    if (sector) {
      setBreadcrumbs([{ id: sector.id, name: sector.name, type: 'sector' }]);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name, type: 'folder' }]);
  };

  const handleBreadcrumbNavigate = (item: BreadcrumbItem | null) => {
    if (!item) {
      setActiveSectorId(null);
      setCurrentFolderId(undefined);
      setBreadcrumbs([]);
      return;
    }

    if (item.type === 'sector') {
      setCurrentFolderId(undefined);
      setBreadcrumbs([item]);
    } else {
      const index = breadcrumbs.findIndex(b => b.id === item.id);
      if (index >= 0) {
        setCurrentFolderId(item.id);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      }
    }
  };

  const handleAddSector = () => {
    setSectorDialogMode('create');
    setEditingSector(null);
    setSectorDialogOpen(true);
  };

  const handleEditSector = (sector: Sector) => {
    setSectorDialogMode('edit');
    setEditingSector(sector);
    setSectorDialogOpen(true);
  };

  const handleSaveSector = (data: { name: string; icon: string }) => {
    if (sectorDialogMode === 'create') {
      addSector(data);
      toast({ title: 'Setor criado', description: `O setor "${data.name}" foi criado.` });
    } else if (editingSector) {
      updateSector(editingSector.id, data);
      toast({ title: 'Setor atualizado', description: `O setor "${data.name}" foi atualizado.` });
    }
  };

  const handleAddFolder = () => {
    setFolderDialogMode('create');
    setEditingFolder(null);
    setFolderDialogOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setFolderDialogMode('edit');
    setEditingFolder(folder);
    setFolderDialogOpen(true);
  };

  const handleSaveFolder = (name: string) => {
    if (folderDialogMode === 'create' && activeSectorId) {
      addFolder({
        sectorId: activeSectorId,
        parentFolderId: currentFolderId,
        name,
      });
      toast({ title: 'Pasta criada', description: `A pasta "${name}" foi criada.` });
    } else if (editingFolder) {
      updateFolder(editingFolder.id, { name });
      toast({ title: 'Pasta renomeada', description: `A pasta foi renomeada para "${name}".` });
    }
  };

  const handleUpload = (files: { file: File; name: string; description: string }[]) => {
    if (!activeSectorId || !currentFolderId) {
      toast({
        title: 'Selecione uma pasta',
        description: 'Navegue até uma pasta antes de fazer upload.',
        variant: 'destructive',
      });
      return;
    }

    files.forEach(({ file, name, description }) => {
      // Use Object URL instead of base64 to avoid localStorage limits
      const fileUrl = URL.createObjectURL(file);
      const type = file.type.includes('pdf')
        ? 'pdf'
        : file.type.includes('image')
        ? 'image'
        : 'doc';

      addDocument({
        sectorId: activeSectorId,
        folderId: currentFolderId,
        name,
        description,
        type,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
    });

    toast({
      title: 'Upload concluído',
      description: `${files.length} arquivo(s) enviado(s) com sucesso.`,
    });
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setDocumentDialogOpen(true);
  };

  const handleSaveDocument = (data: { name: string; description: string }) => {
    if (editingDocument) {
      updateDocument(editingDocument.id, data);
      toast({ title: 'Documento atualizado', description: `O documento "${data.name}" foi atualizado.` });
      // Update viewing document if it's the same one
      if (viewingDocument?.id === editingDocument.id) {
        setViewingDocument({ ...viewingDocument, ...data });
      }
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    switch (deleteTarget.type) {
      case 'sector':
        deleteSector(deleteTarget.id);
        if (activeSectorId === deleteTarget.id) {
          setActiveSectorId(null);
          setBreadcrumbs([]);
        }
        break;
      case 'folder':
        deleteFolder(deleteTarget.id);
        break;
      case 'document':
        deleteDocument(deleteTarget.id);
        break;
    }

    toast({
      title: 'Excluído',
      description: `"${deleteTarget.name}" foi excluído.`,
    });
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = (type: 'sector' | 'folder' | 'document', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeSectorId={activeSectorId}
        onSectorSelect={handleSectorSelect}
        onAddSector={handleAddSector}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <BreadcrumbNav items={breadcrumbs} onNavigate={handleBreadcrumbNavigate} />
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-none h-9 w-9"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-none h-9 w-9"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Actions */}
            {activeSectorId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleAddFolder}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Nova Pasta
                  </DropdownMenuItem>
                  {currentFolderId && (
                    <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload de Arquivos
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEditSector(activeSector!)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar Setor
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => confirmDelete('sector', activeSectorId, activeSector!.name)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Setor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewingDocument ? (
            <DocumentViewer
              document={viewingDocument}
              onBack={() => setViewingDocument(null)}
            />
          ) : searchQuery && searchResults ? (
            // Search Results
            <div className="space-y-6">
              {searchResults.sectors.length === 0 &&
               searchResults.folders.length === 0 &&
               searchResults.documents.length === 0 ? (
                <EmptyState type="search" searchQuery={searchQuery} />
              ) : (
                <>
                  {searchResults.sectors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Setores</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.sectors.map((sector, i) => (
                          <ContentCard
                            key={sector.id}
                            item={{ id: sector.id, name: sector.name, sectorId: sector.id, createdAt: sector.createdAt }}
                            type="folder"
                            onClick={() => handleSectorSelect(sector.id)}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.folders.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Pastas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.folders.map((folder, i) => (
                          <ContentCard
                            key={folder.id}
                            item={folder}
                            type="folder"
                            onClick={() => {
                              handleSectorSelect(folder.sectorId);
                              handleFolderClick(folder);
                            }}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.documents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Documentos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.documents.map((doc, i) => (
                          <ContentCard
                            key={doc.id}
                            item={doc}
                            type="document"
                            onClick={() => setViewingDocument(doc)}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : !activeSectorId ? (
            <EmptyState type="sector" />
          ) : (
            // Normal Content
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFolderId || activeSectorId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {currentFolders.length === 0 && currentDocuments.length === 0 ? (
                  <EmptyState 
                    type={currentFolderId ? 'document' : 'folder'} 
                    onCreateFolder={handleAddFolder}
                    onUpload={() => setUploadDialogOpen(true)}
                  />
                ) : (
                  <div className={`${
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'flex flex-col gap-2'
                  }`}>
                    {/* Folders */}
                    {currentFolders.map((folder, i) => (
                      <ContextMenu key={folder.id}>
                        <ContextMenuTrigger>
                          <ContentCard
                            item={folder}
                            type="folder"
                            onClick={() => handleFolderClick(folder)}
                            onEdit={() => handleEditFolder(folder)}
                            onDelete={() => confirmDelete('folder', folder.id, folder.name)}
                            index={i}
                          />
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleEditFolder(folder)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Renomear
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => confirmDelete('folder', folder.id, folder.name)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}

                    {/* Documents */}
                    {currentDocuments.map((doc, i) => (
                      <ContextMenu key={doc.id}>
                        <ContextMenuTrigger>
                          <ContentCard
                            item={doc}
                            type="document"
                            onClick={() => setViewingDocument(doc)}
                            onEdit={() => handleEditDocument(doc)}
                            onDelete={() => confirmDelete('document', doc.id, doc.name)}
                            index={currentFolders.length + i}
                          />
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleEditDocument(doc)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => confirmDelete('document', doc.id, doc.name)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <SectorDialog
        open={sectorDialogOpen}
        onOpenChange={setSectorDialogOpen}
        onSave={handleSaveSector}
        initialData={editingSector ? { name: editingSector.name, icon: editingSector.icon } : undefined}
        mode={sectorDialogMode}
      />

      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onSave={handleSaveFolder}
        initialName={editingFolder?.name}
        mode={folderDialogMode}
      />

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
      />

      <DocumentDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        onSave={handleSaveDocument}
        initialData={editingDocument ? { name: editingDocument.name, description: editingDocument.description } : undefined}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ''}
        itemType={deleteTarget?.type || 'document'}
      />
    </div>
  );
}
