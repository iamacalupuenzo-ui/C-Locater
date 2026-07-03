import type { ElementType } from 'react';
import { AlertOctagon, Gauge, Clock, Battery, MapPin, Settings, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Alert, AlertType } from '../../lib/alertData';
import { ALERT_TYPE_LABELS, SEVERITY_COLORS } from '../../lib/alertData';
import { useVehicles } from '../../lib/VehicleContext';
import { getCamerasForVehicle } from '../../lib/cameraData';

const TYPE_ICONS: Record<AlertType, ElementType> = {
  geocerca:  MapPin,
  velocidad: Gauge,
  horario:   Clock,
  bateria:   Battery,
  panico:    AlertOctagon,
  sistema:   Settings,
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)   return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  return `hace ${Math.floor(diff / 3600)}h`;
}

interface AlertCardProps {
  alert: Alert;
  onReview: (id: string) => void;
  isDark?: boolean;
}

export function AlertCard({ alert, onReview, isDark = false }: AlertCardProps) {
  const vehicles = useVehicles();
  const Icon     = TYPE_ICONS[alert.type];
  const colors   = SEVERITY_COLORS[alert.severity];
  const isActive = alert.status === 'active';

  const handleReview = () => {
    onReview(alert.id);
    if (alert.severity === 'critical') {
      const vehicle = vehicles.find(v => v.id === alert.vehicleId);
      if (vehicle && getCamerasForVehicle(vehicle.id).length > 0) {
        window.dispatchEvent(new CustomEvent('monitorVehicle', { detail: vehicle }));
      }
    }
  };

  return (
    <div className={cn(
      'rounded-[10px] border px-3 py-2.5 transition-all',
      isDark
        ? 'bg-zinc-800/60 border-transparent hover:border-zinc-700'
        : 'bg-white border-transparent hover:border-blue-200',
    )}>
      <div className="flex items-start gap-2.5">
        {/* Ícono — mismo tamaño y shape que VehicleAccordionItem */}
        <div className={cn(
          'border flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg mt-0.5',
          colors.bg, colors.border,
        )}>
          <Icon className={cn('w-3.5 h-3.5', colors.text)} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Línea 1: placa + badge de severidad */}
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className={cn(
              'font-bold tracking-tight leading-none shrink-0 text-[13px]',
              isDark ? 'text-zinc-50' : 'text-slate-900',
            )}>
              {alert.vehiclePlate.replace(/-/g, '')}
            </span>
            <span className={cn(
              'text-[10px] font-medium leading-none truncate',
              isDark ? 'text-zinc-500' : 'text-slate-400',
            )}>
              {alert.vehicleAlias}
            </span>
            <span className={cn(
              'ml-auto shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full',
              alert.severity === 'critical' ? 'bg-red-500 text-white' :
              alert.severity === 'warning'  ? 'bg-amber-400 text-white' :
                                              'bg-blue-500 text-white',
            )}>
              {alert.severity === 'critical' ? 'CRÍTICO' : alert.severity === 'warning' ? 'ALERTA' : 'INFO'}
            </span>
          </div>

          {/* Descripción */}
          <p className={cn(
            'text-[11px] leading-snug',
            isDark ? 'text-zinc-400' : 'text-slate-600',
          )}>
            {alert.description}
          </p>

          {/* Línea 3: tipo · tiempo + acción */}
          <div className="flex items-center justify-between mt-1.5">
            <span className={cn('text-[10px]', isDark ? 'text-zinc-600' : 'text-slate-400')}>
              {ALERT_TYPE_LABELS[alert.type]} · {timeAgo(alert.timestamp)}
            </span>
            {isActive && (
              <button
                onClick={handleReview}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-brand hover:text-brand/80 transition-colors"
              >
                Revisar
                <ChevronRight className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
            {alert.status === 'attending' && (
              <span className={cn('text-[10px] font-semibold', isDark ? 'text-amber-400' : 'text-amber-600')}>
                En atención
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
