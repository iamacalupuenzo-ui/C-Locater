import { cn } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';

interface VehicleInfoCardProps {
  vehicle: Vehicle;
  isDark?: boolean;
}

export function VehicleInfoCard({ vehicle, isDark = false }: VehicleInfoCardProps) {
  const rows = [
    { label: 'Placa',       value: vehicle.plate     },
    { label: 'Tipo',        value: vehicle.type      },
    { label: 'Propietario', value: vehicle.owner     },
    { label: 'Odómetro',    value: vehicle.odometer  },
    { label: 'Combustible', value: `${vehicle.fuel}%` },
    { label: 'Velocidad',   value: vehicle.speed     },
  ];

  return (
    <div className={cn(
      'rounded px-3 py-2.5',
      isDark
        ? 'bg-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
        : 'bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
    )}>
      <span className={cn('text-[10px] font-semibold uppercase tracking-wider block mb-2', isDark ? 'text-zinc-500' : 'text-slate-400')}>
        Información del vehículo
      </span>
      <div className="flex flex-col gap-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className={cn('text-[11px] leading-none', isDark ? 'text-zinc-500' : 'text-slate-400')}>
              {label}
            </span>
            <span className={cn('text-[11px] font-semibold leading-none text-right', isDark ? 'text-zinc-200' : 'text-slate-700')}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
