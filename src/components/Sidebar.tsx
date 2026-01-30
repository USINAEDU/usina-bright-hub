import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentStore } from '@/contexts/DocumentStoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Plus, 
  LogOut,
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
  ChevronRight,
} from 'lucide-react';
import logoUsina from '@/assets/logo-usina-branca.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

interface SidebarProps {
  activeSectorId: string | null;
  onSectorSelect: (sectorId: string) => void;
  onAddSector: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Sidebar({
  activeSectorId,
  onSectorSelect,
  onAddSector,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { sectors, getSectorDocumentCount } = useDocumentStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Folder;
    return Icon;
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-72 h-screen bg-sidebar text-sidebar-foreground flex flex-col shadow-xl"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logoUsina} alt="Usina Docs" className="h-10 w-auto" />
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus-visible:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Sectors List */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
            Setores
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddSector}
            className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {sectors.map((sector, index) => {
            const Icon = getIcon(sector.icon);
            const isActive = sector.id === activeSectorId;
            const docCount = getSectorDocumentCount(sector.id);

            return (
              <motion.button
                key={sector.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSectorSelect(sector.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all group ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left text-sm font-medium truncate">
                  {sector.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-sidebar-foreground/20' 
                    : 'bg-sidebar-accent text-sidebar-foreground/60'
                }`}>
                  {docCount}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  isActive ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'
                }`} />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
        </div>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja sair do sistema?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>Sair</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.aside>
  );
}
