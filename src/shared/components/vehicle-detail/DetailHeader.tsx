import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';

interface DetailHeaderProps {
  vehicle: Vehicle;
  onBack: () => void;
  isDark?: boolean;
}

const STATUS_MAP = {
  active:  { label: 'Activo',    dot: 'bg-emerald-500' },
  stopped: { label: 'Detenido',  dot: 'bg-amber-400'   },
  offline: { label: 'Sin señal', dot: 'bg-slate-400'   },
};

export function DetailHeader({ vehicle, onBack, isDark = false }: DetailHeaderProps) {
  const status = STATUS_MAP[vehicle.status];

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 border-b shrink-0',
      isDark ? 'border-zinc-800 bg-zinc-900' : 'border-neutral-200 bg-white',
    )}>
      <button
        onClick={onBack}
        className={cn(
          'w-7 h-7 flex items-center justify-center rounded transition-colors shrink-0',
          isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'hover:bg-neutral-100 text-slate-400 hover:text-slate-700',
        )}
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
      </button>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-[14px] font-bold tracking-tight leading-none', isDark ? 'text-zinc-100' : 'text-slate-900')}>
            {vehicle.plate}
          </span>
          <span className={cn('text-[10px] font-medium text-slate-400 leading-none', isDark && 'text-zinc-500')}>
            {vehicle.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dot)} />
          <span className={cn('text-[11px] font-medium leading-none', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            {status.label}
          </span>
          <span className={cn('text-slate-300 text-[10px]', isDark && 'text-zinc-700')}>·</span>
          <span className={cn('text-[11px] leading-none', isDark ? 'text-zinc-500' : 'text-slate-400')}>
            {vehicle.type}
          </span>
        </div>
      </div>

      <button className={cn(
        'w-7 h-7 flex items-center justify-center rounded transition-colors shrink-0',
        isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200' : 'hover:bg-neutral-100 text-slate-400 hover:text-slate-600',
      )}>
        <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
