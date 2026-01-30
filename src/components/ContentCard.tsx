import { motion } from 'framer-motion';
import { FileText, Folder, Image, FileIcon } from 'lucide-react';
import { Document, Folder as FolderType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContentCardProps {
  item: Document | FolderType;
  type: 'document' | 'folder';
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  index?: number;
}

export default function ContentCard({ item, type, onClick, onContextMenu, index = 0 }: ContentCardProps) {
  const isDocument = type === 'document';
  const doc = item as Document;

  const getDocumentIcon = (docType?: string) => {
    switch (docType) {
      case 'pdf':
        return <FileText className="w-8 h-8" />;
      case 'image':
        return <Image className="w-8 h-8" />;
      default:
        return <FileIcon className="w-8 h-8" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="group cursor-pointer"
    >
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
          isDocument 
            ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' 
            : 'bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground'
        }`}>
          {isDocument ? getDocumentIcon(doc.type) : <Folder className="w-8 h-8" />}
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground truncate mb-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>

        {isDocument && doc.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {doc.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(item.createdAt), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
          {isDocument && (
            <span className="bg-muted px-2 py-0.5 rounded">
              {formatFileSize(doc.fileSize)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
