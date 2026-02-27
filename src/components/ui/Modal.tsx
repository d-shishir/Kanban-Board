import * as React from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/25 dark:bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.22, type: 'spring', bounce: 0.06 }}
        className={cn(
          'relative z-50 w-full sm:max-w-md overflow-hidden',
          'rounded-t-2xl sm:rounded-2xl',
          'border-t sm:border border-white/30 dark:border-white/10 border-x border-white/30 dark:border-white/10',
          'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl',
          'shadow-2xl shadow-black/15 dark:shadow-black/40',
        )}
      >
        {/* Drag handle on mobile */}
        <div className="flex sm:hidden justify-center pt-2.5 pb-1">
          <div className="h-1 w-8 rounded-full bg-foreground/10" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-black/6 dark:border-white/6">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[80dvh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
