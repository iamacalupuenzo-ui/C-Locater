import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Copy, Clock } from 'lucide-react';
import type { Vehicle } from '../../lib/data';

interface SharePopoverProps {
  vehicle: Vehicle;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onOpenHistory: () => void;
  onShowToast: (msg: string) => void;
}

export function SharePopover({ vehicle, triggerRef, onClose, onOpenHistory, onShowToast }: SharePopoverProps) {
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 272;
      let left = rect.right + 12;
      if (left + popoverWidth > window.innerWidth - 20) left = rect.left - popoverWidth - 12;
      setPos({ top: rect.top - 8, left });
    }
  }, [triggerRef]);

  React.useEffect(() => {
    if (!pos) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pos, onClose]);

  if (!pos) return null;

  return createPortal(
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{ top: pos.top, left: pos.left }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[9999] w-[264px] bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] p-3 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[12px] font-bold text-slate-800">Compartir ubicación</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
        <span className="text-[11px] font-bold text-slate-700">{vehicle.plate}</span>
        <span className="text-slate-300 text-[10px]">·</span>
        <span className="text-[11px] font-medium text-slate-500 truncate">{vehicle.name}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          readOnly
          value={`https://c-locater.com/track/${vehicle.id}`}
          className="flex-1 min-w-0 text-[10.5px] font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-copy truncate"
          onClick={(e) => e.currentTarget.select()}
        />
        <button
          className="shrink-0 w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-brand/10 hover:text-brand rounded-lg transition-colors border border-slate-200"
          title="Copiar enlace"
          onClick={() => {
            navigator.clipboard.writeText(`https://c-locater.com/track/${vehicle.id}`);
            onShowToast('Enlace copiado al portapapeles');
          }}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      <select
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/15 transition-all cursor-pointer"
      >
        <option value="1">Vigencia: 1 hora</option>
        <option value="8">Vigencia: 8 horas</option>
        <option value="24">Vigencia: 24 horas</option>
        <option value="indefinite">Vigencia: Indefinida</option>
      </select>

      <button
        onClick={() => { onShowToast('Ubicación compartida exitosamente'); onClose(); }}
        className="w-full py-1.5 bg-brand text-white rounded-lg text-[11px] font-semibold hover:bg-brand-hover transition-colors shadow-sm mt-0.5"
      >
        Guardar compartido
      </button>

      <div className="h-px bg-slate-100" />
      <button
        onClick={() => { onClose(); onOpenHistory(); }}
        className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-brand transition-colors py-0.5"
      >
        <Clock className="w-3 h-3" /> Ver historial de compartidos
      </button>
    </motion.div>,
    document.body
  );
}
