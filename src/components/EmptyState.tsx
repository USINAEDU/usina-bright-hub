import { motion } from 'framer-motion';
import { FolderOpen, FileText, Search } from 'lucide-react';

interface EmptyStateProps {
  type: 'sector' | 'folder' | 'search';
  searchQuery?: string;
}

export default function EmptyState({ type, searchQuery }: EmptyStateProps) {
  const content = {
    sector: {
      icon: FolderOpen,
      title: 'Selecione um setor',
      description: 'Escolha um setor na barra lateral para visualizar suas pastas e documentos.',
    },
    folder: {
      icon: FileText,
      title: 'Pasta vazia',
      description: 'Esta pasta ainda não possui documentos. Faça upload de arquivos para começar.',
    },
    search: {
      icon: Search,
      title: 'Nenhum resultado encontrado',
      description: `Não encontramos resultados para "${searchQuery}". Tente outro termo.`,
    },
  };

  const { icon: Icon, title, description } = content[type];

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
      <p className="text-muted-foreground max-w-md">{description}</p>
    </motion.div>
  );
}
