import { Phone } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DriverInfo {
  name: string;
  phone: string;
  initials: string;
}

interface DriverCardProps {
  driver: DriverInfo;
  isDark?: boolean;
}

export function DriverCard({ driver, isDark = false }: DriverCardProps) {
  return (
    <div className={cn(
      'rounded px-3 py-2.5',
      isDark
        ? 'bg-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
        : 'bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
    )}>
      <span className={cn('text-[10px] font-semibold uppercase tracking-wider block mb-2', isDark ? 'text-zinc-500' : 'text-slate-400')}>
        Conductor
      </span>
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-8 h-8 rounded flex items-center justify-center text-[12px] font-bold shrink-0',
          isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-neutral-100 text-slate-600',
        )}>
          {driver.initials}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className={cn('text-[12px] font-semibold leading-tight', isDark ? 'text-zinc-100' : 'text-slate-800')}>
            {driver.name}
          </span>
          <span className={cn('text-[10.5px] leading-tight mt-0.5', isDark ? 'text-zinc-500' : 'text-slate-400')}>
            {driver.phone}
          </span>
        </div>
        <button className={cn(
          'w-7 h-7 rounded flex items-center justify-center transition-colors shrink-0',
          isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-neutral-100 hover:bg-neutral-200 text-slate-500',
        )}>
          <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
