import { Activity, Clock, Route, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatItem {
  icon: React.ElementType;
  iconColor: string;
  value: string;
  label: string;
}

interface TripStatsRowProps {
  distancia: string;
  tiempo: string;
  viajes: string;
  alertas: number;
  isDark?: boolean;
}

export function TripStatsRow({ distancia, tiempo, viajes, alertas, isDark = false }: TripStatsRowProps) {
  const stats: StatItem[] = [
    { icon: Route,         iconColor: 'text-emerald-500', value: distancia, label: 'Recorrido'  },
    { icon: Clock,         iconColor: 'text-blue-400',    value: tiempo,    label: 'En ruta'    },
    { icon: Activity,      iconColor: 'text-amber-500',   value: viajes,    label: 'Viajes'     },
    { icon: AlertTriangle, iconColor: 'text-rose-400',    value: String(alertas), label: 'Alertas' },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {stats.map(({ icon: Icon, iconColor, value, label }) => (
        <div
          key={label}
          className={cn(
            'flex flex-col items-center gap-1 py-2.5 rounded',
            isDark
              ? 'bg-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
              : 'bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
          )}
        >
          <Icon className={cn('w-3.5 h-3.5', iconColor)} strokeWidth={1.75} />
          <span className={cn('text-[12px] font-bold leading-none', isDark ? 'text-zinc-100' : 'text-slate-800')}>
            {value}
          </span>
          <span className={cn('text-[9px] font-medium leading-none', isDark ? 'text-zinc-500' : 'text-slate-400')}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
