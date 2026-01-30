import { motion } from 'framer-motion';
import { FolderOpen, FileText, Search, FolderPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'sector' | 'folder' | 'document' | 'search';
  searchQuery?: string;
  onCreateFolder?: () => void;
  onUpload?: () => void;
}

export default function EmptyState({ type, searchQuery, onCreateFolder, onUpload }: EmptyStateProps) {
  const content = {
    sector: {
      icon: FolderOpen,
      title: 'Selecione um setor',
      description: 'Escolha um setor na barra lateral para visualizar suas pastas e documentos.',
    },
    folder: {
      icon: FolderPlus,
      title: 'Setor vazio',
      description: 'Este setor ainda não possui pastas. Crie uma pasta para organizar seus documentos.',
    },
    document: {
      icon: Upload,
      title: 'Pasta vazia',
      description: 'Esta pasta ainda não possui documentos. Faça upload de arquivos para começar.',
    },
    search: {
      icon: Search,
      title: 'Nenhum resultado encontrado',
      description: `Não encontramos resultados para "${searchQuery}". Tente outro termo.`,
    },
  };

  const { icon: Icon, title, description } = content[type] || content.sector;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="p-6 rounded-full bg-muted mb-6">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      <div className="flex gap-3">
        {type === 'folder' && onCreateFolder && (
          <Button onClick={onCreateFolder} size="lg">
            <FolderPlus className="w-5 h-5 mr-2" />
            Criar Pasta
          </Button>
        )}
        {type === 'document' && (
          <>
            {onCreateFolder && (
              <Button variant="outline" onClick={onCreateFolder} size="lg">
                <FolderPlus className="w-5 h-5 mr-2" />
                Nova Subpasta
              </Button>
            )}
            {onUpload && (
              <Button onClick={onUpload} size="lg">
                <Upload className="w-5 h-5 mr-2" />
                Fazer Upload
              </Button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
