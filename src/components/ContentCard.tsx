import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Folder, Image, FileIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Document, Folder as FolderType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentCardProps {
  item: Document | FolderType;
  type: 'document' | 'folder';
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  index?: number;
}

const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(({ 
  item, 
  type, 
  onClick, 
  onEdit,
  onDelete,
  onContextMenu, 
  index = 0 
}, ref) => {
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

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="group cursor-pointer"
    >
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative">
        {/* Menu Button */}
        {(onEdit || onDelete) && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={handleMenuClick}>
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    <Pencil className="w-4 h-4 mr-2" />
                    {isDocument ? 'Editar' : 'Renomear'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
          isDocument 
            ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' 
            : 'bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground'
        }`}>
          {isDocument ? getDocumentIcon(doc.type) : <Folder className="w-8 h-8" />}
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground truncate mb-1 group-hover:text-primary transition-colors pr-8">
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
});

ContentCard.displayName = 'ContentCard';

export default ContentCard;
