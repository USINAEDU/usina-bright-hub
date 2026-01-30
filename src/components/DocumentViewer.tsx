import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Image, FileIcon, Download, ArrowLeft, ExternalLink } from 'lucide-react';
import { Document as DocType } from '@/types';

interface DocumentViewerProps {
  document: DocType;
  onBack: () => void;
}

export default function DocumentViewer({ document, onBack }: DocumentViewerProps) {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{document.name}</h2>
            {document.description && (
              <p className="text-sm text-muted-foreground truncate">
                {document.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden rounded-lg bg-muted/30 flex items-center justify-center">
        {document.type === 'image' ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={document.fileUrl}
            alt={document.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        ) : document.type === 'pdf' ? (
          <iframe
            src={document.fileUrl}
            title={document.name}
            className="w-full h-full rounded-lg border-0"
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
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
        <span className="text-sm text-muted-foreground">
          {document.fileName} • {formatFileSize(document.fileSize)}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir em Nova Aba
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
