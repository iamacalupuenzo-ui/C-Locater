import type { ElementType, ReactNode } from 'react';
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ElementType;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

const maxWidths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Modal({ isOpen, onClose, title, icon: Icon, children, footer, maxWidth = 'md', className }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            className={cn('relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col', maxWidths[maxWidth], className)}
            role="dialog" aria-modal="true" aria-labelledby="modal-title"
          >
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
              <h3 id="modal-title" className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-brand" />}
                {title}
              </h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
            {footer && <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
