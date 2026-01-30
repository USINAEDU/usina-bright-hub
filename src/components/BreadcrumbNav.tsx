import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem | null) => void;
}

export default function BreadcrumbNav({ items, onNavigate }: BreadcrumbNavProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 text-sm"
    >
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </button>

      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <button
            onClick={() => onNavigate(item)}
            className={`hover:text-foreground transition-colors ${
              index === items.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </motion.nav>
  );
}
