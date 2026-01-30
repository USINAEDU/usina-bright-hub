import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Folder,
  Users,
  DollarSign,
  Megaphone,
  Monitor,
  Settings,
  Building2,
  Briefcase,
  BookOpen,
  Archive,
  FileBox,
} from 'lucide-react';

const ICONS = [
  { name: 'Folder', icon: Folder },
  { name: 'Users', icon: Users },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Monitor', icon: Monitor },
  { name: 'Settings', icon: Settings },
  { name: 'Building2', icon: Building2 },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Archive', icon: Archive },
  { name: 'FileBox', icon: FileBox },
];

interface SectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; icon: string }) => void;
  initialData?: { name: string; icon: string };
  mode: 'create' | 'edit';
}

export default function SectorDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode,
}: SectorDialogProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');

  // Sync initial values when dialog opens
  useEffect(() => {
    if (open) {
      setName(initialData?.name || '');
      setSelectedIcon(initialData?.icon || 'Folder');
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), icon: selectedIcon });
      setName('');
      setSelectedIcon('Folder');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Setor' : 'Editar Setor'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do setor</Label>
            <Input
              id="name"
              placeholder="Ex: Recursos Humanos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(({ name: iconName, icon: Icon }) => (
                <motion.button
                  key={iconName}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedIcon === iconName
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                </motion.button>
              ))}
            </div>
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
