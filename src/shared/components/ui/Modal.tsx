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
          {/* Overlay — más suave */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
            className={cn(
              'relative w-full bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-slate-200/60 overflow-hidden flex flex-col',
              maxWidths[maxWidth],
              className
            )}
            role="dialog" aria-modal="true" aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
              <h3 id="modal-title" className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5 text-brand" strokeWidth={1.75} />}
                {title}
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="p-5">{children}</div>
            {/* Footer */}
            {footer && (
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
