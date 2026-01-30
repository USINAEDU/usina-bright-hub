import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Image, FileIcon, Download, Share2, ExternalLink } from 'lucide-react';
import { Document as DocType } from '@/types';

interface DocumentPreviewProps {
  document: DocType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentPreview({
  document,
  open,
  onOpenChange,
}: DocumentPreviewProps) {
  if (!document) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
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

  const handleOpenInNewTab = () => {
    window.open(document.fileUrl, '_blank');
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl truncate">{document.name}</DialogTitle>
            {document.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {document.description}
              </p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden rounded-lg bg-muted/30 flex items-center justify-center min-h-[400px]">
          {document.type === 'image' ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={document.fileUrl}
              alt={document.name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
            />
          ) : document.type === 'pdf' ? (
            <iframe
              src={document.fileUrl}
              title={document.name}
              className="w-full h-[60vh] rounded-lg border-0"
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
              <p className="text-sm text-muted-foreground mt-4">
                Este tipo de arquivo não possui visualização inline.
              </p>
              <Button className="mt-4" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Fazer Download
              </Button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground border-t">
          <span>{document.fileName} • {formatFileSize(document.fileSize)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
