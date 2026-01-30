import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Image, FileIcon, Download, X, Share2 } from 'lucide-react';
import { Document } from '@/types';

interface DocumentPreviewProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentPreview({
  document,
  open,
  onOpenChange,
}: DocumentPreviewProps) {
  if (!document) return null;

  const getIcon = () => {
    switch (document.type) {
      case 'pdf':
        return <FileText className="w-16 h-16" />;
      case 'image':
        return <Image className="w-16 h-16" />;
      default:
        return <FileIcon className="w-16 h-16" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
    // For localStorage-based files, create a download link
    const link = window.document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.fileName;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.name,
          text: document.description || '',
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <DialogTitle className="text-xl">{document.name}</DialogTitle>
            {document.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {document.description}
              </p>
            )}
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden rounded-lg bg-muted/50 flex items-center justify-center min-h-[300px]">
          {document.type === 'image' ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={document.fileUrl}
              alt={document.name}
              className="max-w-full max-h-[500px] object-contain rounded-lg"
            />
          ) : (
            <div className="text-center p-8">
              <div className="inline-flex p-6 rounded-2xl bg-primary/10 text-primary mb-4">
                {getIcon()}
              </div>
              <p className="text-lg font-medium text-foreground">
                {document.fileName}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatFileSize(document.fileSize)}
              </p>
              {document.type === 'pdf' && (
                <p className="text-sm text-muted-foreground mt-4">
                  Visualização de PDF disponível após download
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {document.fileName} • {formatFileSize(document.fileSize)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
