import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  itemType: 'sector' | 'folder' | 'document';
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType,
}: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!open) {
      setConfirmText('');
    }
  }, [open]);

  const isConfirmed = confirmText === itemName;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      onOpenChange(false);
    }
  };

  const getTypeLabel = () => {
    switch (itemType) {
      case 'sector':
        return 'o setor';
      case 'folder':
        return 'a pasta';
      case 'document':
        return 'o documento';
    }
  };

  const getWarningMessage = () => {
    switch (itemType) {
      case 'sector':
        return (
          <>
            <strong>Todas as pastas e documentos</strong> dentro deste setor serão{' '}
            <strong>permanentemente excluídos</strong>.
          </>
        );
      case 'folder':
        return (
          <>
            <strong>Todos os documentos e subpastas</strong> dentro desta pasta serão{' '}
            <strong>permanentemente excluídos</strong>.
          </>
        );
      case 'document':
        return (
          <>
            O documento será <strong>permanentemente excluído</strong>.
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Excluir {getTypeLabel()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Box */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-destructive">
              ⚠️ Ação irreversível
            </p>
            <p className="text-sm text-foreground">
              {getWarningMessage()}
            </p>
            <p className="text-sm text-muted-foreground">
              Este sistema <strong>não possui lixeira</strong>. Uma vez excluído, não será possível recuperar.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm">
              Para confirmar, digite o nome: <strong className="text-foreground">{itemName}</strong>
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Digite "${itemName}" para confirmar`}
              className={confirmText && !isConfirmed ? 'border-destructive' : ''}
              autoComplete="off"
            />
            {confirmText && !isConfirmed && (
              <p className="text-xs text-destructive">
                O texto não corresponde ao nome do item
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            Excluir permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
