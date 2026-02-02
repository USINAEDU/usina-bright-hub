import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Image, FileIcon, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { Document as DocType } from '@/types';

interface DocumentViewerProps {
  document: DocType;
  onBack: () => void;
}

export default function DocumentViewer({ document, onBack }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // Check if fileUrl is valid
  const hasValidUrl = document.fileUrl && document.fileUrl.length > 0;

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
      <div className="flex-1 overflow-hidden rounded-lg bg-muted/30 flex items-center justify-center min-h-[400px]">
        {!hasValidUrl ? (
          // No valid URL - file needs re-upload (localStorage limitation)
          <div className="text-center p-8">
            <div className="inline-flex p-6 rounded-2xl bg-destructive/10 text-destructive mb-4">
              <AlertTriangle className="w-16 h-16" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Arquivo não disponível
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Este arquivo foi salvo em uma sessão anterior e precisa ser re-uploadado.
              Para persistência permanente, conecte ao Lovable Cloud.
            </p>
          </div>
        ) : error ? (
          // Error loading file
          <div className="text-center p-8">
            <div className="inline-flex p-6 rounded-2xl bg-destructive/10 text-destructive mb-4">
              <AlertTriangle className="w-16 h-16" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Erro ao carregar arquivo
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Não foi possível exibir o arquivo.
            </p>
          </div>
        ) : document.type === 'image' ? (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: loading ? 0 : 1, scale: 1 }}
              src={document.fileUrl}
              alt={document.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onLoad={handleLoad}
              onError={handleError}
            />
          </>
        ) : document.type === 'pdf' ? (
          <div className="w-full h-full relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <iframe
              src={`${document.fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              title={document.name}
              className="w-full h-full rounded-lg border-0"
              onLoad={handleLoad}
              onError={handleError}
              style={{ pointerEvents: 'auto' }}
            />
            {/* Overlay para bloquear clique direito */}
            <div 
              className="absolute inset-0 pointer-events-none"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
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
      <div className="flex items-center justify-center pt-4 border-t border-border mt-4">
        <span className="text-sm text-muted-foreground">
          {document.fileName} • {formatFileSize(document.fileSize)}
        </span>
      </div>
    </motion.div>
  );
}
