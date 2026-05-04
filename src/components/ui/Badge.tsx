import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type StatusKey = 'activo' | 'inactivo' | 'active' | 'stopped' | 'offline';

const STATUS_CONFIG: Record<StatusKey, { label: string; dot: string; bg: string; text: string }> = {
  activo:   { label: 'Activo',    dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  active:   { label: 'Activo',    dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  inactivo: { label: 'Inactivo',  dot: 'bg-gray-300',    bg: 'bg-gray-100',    text: 'text-gray-500'    },
  stopped:  { label: 'Detenido',  dot: 'bg-red-400',     bg: 'bg-red-50',      text: 'text-red-600'     },
  offline:  { label: 'Sin señal', dot: 'bg-gray-300',    bg: 'bg-gray-100',    text: 'text-gray-500'    },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.inactivo;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function TagBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md truncate max-w-[180px]', className)}>
      {children}
    </span>
  );
}

/** Numeric count badge (e.g. "Unidades: 6") */
export function CountBadge({ count, label, className }: { count: number | string; label?: string; className?: string }) {
  return (
    <div className={cn('bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 flex items-center gap-2', className)}>
      {label && <span className="text-[10px] font-semibold text-gray-500 uppercase">{label}</span>}
      <span className="text-[13px] font-bold text-gray-900 bg-white px-1.5 py-0.5 rounded shadow-sm border border-black/5">
        {count}
      </span>
    </div>
  );
}
