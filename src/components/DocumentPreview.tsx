import { useState } from 'react';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Image, FileIcon, Download, Share2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Document as DocType } from '@/types';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);

  if (!document) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
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

  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
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
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto rounded-lg bg-muted/30 flex items-center justify-center min-h-[400px] relative">
          {document.type === 'image' ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={document.fileUrl}
              alt={document.name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
            />
          ) : document.type === 'pdf' ? (
            <div className="flex flex-col items-center">
              <Document
                file={document.fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-pulse text-muted-foreground">Carregando PDF...</div>
                  </div>
                }
                error={
                  <div className="text-center p-8">
                    <div className="inline-flex p-6 rounded-2xl bg-destructive/10 text-destructive mb-4">
                      <FileText className="w-12 h-12" />
                    </div>
                    <p className="text-muted-foreground">Erro ao carregar PDF</p>
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  className="shadow-lg rounded-lg overflow-hidden"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
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
                Este tipo de arquivo não possui visualização. Faça o download para abrir.
              </p>
            </div>
          )}
        </div>

        {/* PDF Controls */}
        {document.type === 'pdf' && numPages > 0 && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="outline" size="icon" onClick={zoomIn} disabled={scale >= 2}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousPage} disabled={pageNumber <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                {pageNumber} / {numPages}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <span>{document.fileName} • {formatFileSize(document.fileSize)}</span>
          {document.type === 'image' && (
            <span>Clique para ampliar</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
