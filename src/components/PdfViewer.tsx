import { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  fileUrl: string;
  onLoadSuccess?: () => void;
  onLoadError?: () => void;
}

export default function PdfViewer({ fileUrl, onLoadSuccess, onLoadError }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate optimal page width based on container
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        // Use 90% of container width, max 900px
        const optimalWidth = Math.min(containerWidth * 0.9, 900);
        setPageWidth(optimalWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    onLoadSuccess?.();
  }, [onLoadSuccess]);

  const onDocumentLoadError = useCallback(() => {
    setLoading(false);
    onLoadError?.();
  }, [onLoadError]);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  // Prevent context menu (right-click)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full w-full items-center"
      onContextMenu={handleContextMenu}
    >
      {/* PDF Document */}
      <div className="flex-1 overflow-hidden flex items-center justify-center w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="flex items-center justify-center"
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg rounded-lg overflow-hidden"
            loading={null}
          />
        </Document>
      </div>

      {/* Page Navigation */}
      {numPages > 0 && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-border mt-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground min-w-[100px] text-center">
            Página {pageNumber} de {numPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            Próxima
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
