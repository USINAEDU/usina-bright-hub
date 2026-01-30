import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  name: string;
  description: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: { file: File; name: string; description: string }[]) => void;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export default function UploadDialog({
  open,
  onOpenChange,
  onUpload,
}: UploadDialogProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: 'pending',
      name: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Simulate upload progress
    for (const uploadFile of files) {
      updateFile(uploadFile.id, { status: 'uploading' });

      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((r) => setTimeout(r, 50));
        updateFile(uploadFile.id, { progress });
      }

      updateFile(uploadFile.id, { status: 'complete', progress: 100 });
    }

    await new Promise((r) => setTimeout(r, 300));

    onUpload(
      files.map((f) => ({
        file: f.file,
        name: f.name,
        description: f.description,
      }))
    );

    setFiles([]);
    setIsUploading(false);
    onOpenChange(false);
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Imagem';
    if (mimeType.includes('word')) return 'DOCX';
    return 'Arquivo';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload de Documentos</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ scale: isDragActive ? 1.05 : 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isDragActive
                    ? 'Solte os arquivos aqui'
                    : 'Arraste arquivos ou clique para selecionar'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, PNG, JPG, JPEG, DOCX
                </p>
              </div>
            </motion.div>
          </div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {files.map((uploadFile) => (
                  <motion.div
                    key={uploadFile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <File className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {getFileTypeLabel(uploadFile.file.type)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(uploadFile.file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Input
                            placeholder="Nome do documento"
                            value={uploadFile.name}
                            onChange={(e) =>
                              updateFile(uploadFile.id, { name: e.target.value })
                            }
                            disabled={isUploading}
                            className="h-9"
                          />
                          <Textarea
                            placeholder="Descrição (opcional)"
                            value={uploadFile.description}
                            onChange={(e) =>
                              updateFile(uploadFile.id, {
                                description: e.target.value,
                              })
                            }
                            disabled={isUploading}
                            rows={2}
                            className="resize-none"
                          />
                        </div>

                        {uploadFile.status !== 'pending' && (
                          <div className="flex items-center gap-3">
                            <Progress
                              value={uploadFile.progress}
                              className="flex-1 h-2"
                            />
                            {uploadFile.status === 'complete' && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                            {uploadFile.status === 'error' && (
                              <AlertCircle className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>

                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(uploadFile.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? 'Enviando...' : `Enviar ${files.length} arquivo${files.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
