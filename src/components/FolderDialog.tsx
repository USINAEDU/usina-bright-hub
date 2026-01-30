import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  initialName?: string;
  mode: 'create' | 'edit';
}

export default function FolderDialog({
  open,
  onOpenChange,
  onSave,
  initialName,
  mode,
}: FolderDialogProps) {
  const [name, setName] = useState(initialName || '');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Pasta' : 'Renomear Pasta'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Nome da pasta</Label>
            <Input
              id="folderName"
              placeholder="Ex: Planejamento 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {mode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
