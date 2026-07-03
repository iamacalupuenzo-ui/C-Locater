import { useEffect, useRef } from 'react';
import type { ElementType } from 'react';
import { motion } from 'motion/react';
import { X, AlertOctagon, Gauge, Clock, Battery, MapPin, Settings, Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Alert, AlertType } from '../../lib/alertData';
import { ALERT_TYPE_LABELS } from '../../lib/alertData';

const TYPE_ICONS: Record<AlertType, ElementType> = {
  geocerca:  MapPin,
  velocidad: Gauge,
  horario:   Clock,
  bateria:   Battery,
  panico:    AlertOctagon,
  sistema:   Settings,
};

interface AlertPopupProps {
  alert: Alert;
  onDismiss: (id: string) => void;
  onReview: (id: string) => void;
}

export function AlertPopup({ alert, onDismiss, onReview }: AlertPopupProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = TYPE_ICONS[alert.type];
  const isCritical = alert.severity === 'critical';

  useEffect(() => {
    if (!isCritical) {
      timerRef.current = setTimeout(() => onDismiss(alert.id), 6000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [alert.id, isCritical, onDismiss]);

  useEffect(() => {
    if (isCritical && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(
        `Alerta crítica. ${ALERT_TYPE_LABELS[alert.type]}. Vehículo ${alert.vehiclePlate}.`
      );
      msg.lang  = 'es-PE';
      msg.rate  = 0.95;
      msg.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    }
  }, [alert.id, isCritical, alert.type, alert.vehiclePlate]);

  const borderColor =
    alert.severity === 'critical' ? 'border-l-red-500' :
    alert.severity === 'warning'  ? 'border-l-amber-400' :
                                    'border-l-blue-500';

  const iconBg =
    alert.severity === 'critical' ? 'bg-red-100' :
    alert.severity === 'warning'  ? 'bg-amber-100' :
                                    'bg-blue-100';

  const iconColor =
    alert.severity === 'critical' ? 'text-red-600' :
    alert.severity === 'warning'  ? 'text-amber-600' :
                                    'text-blue-600';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0,  scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'w-[320px] bg-white/95 backdrop-blur-xl border border-white/70 rounded-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.18)] border-l-4 overflow-hidden',
        borderColor,
      )}
    >
      <div className="flex items-start gap-2.5 p-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
          {isCritical
            ? <Volume2 className={cn('w-4 h-4', iconColor)} strokeWidth={2} />
            : <Icon    className={cn('w-4 h-4', iconColor)} strokeWidth={2} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[11px] font-bold text-slate-800 truncate">
              {ALERT_TYPE_LABELS[alert.type]}
            </span>
            <button
              onClick={() => onDismiss(alert.id)}
              className="shrink-0 w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors rounded"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug mb-0.5">{alert.description}</p>
          <p className="text-[10px] text-slate-400">
            {alert.vehiclePlate} · {alert.vehicleAlias}
          </p>
        </div>
      </div>

      <div className={cn('flex border-t', alert.severity === 'critical' ? 'border-red-100' : 'border-slate-100')}>
        <button
          onClick={() => onDismiss(alert.id)}
          className={cn(
            'flex-1 py-2 text-[11px] font-medium transition-colors border-r',
            isCritical
              ? 'text-red-400 hover:bg-red-50 border-red-100'
              : 'text-slate-500 hover:bg-slate-50 border-slate-100',
          )}
        >
          Ignorar
        </button>
        <button
          onClick={() => { onReview(alert.id); onDismiss(alert.id); }}
          className={cn(
            'flex-1 py-2 text-[11px] font-bold transition-colors',
            isCritical
              ? 'text-red-600 hover:bg-red-50'
              : 'text-brand hover:bg-brand/5',
          )}
        >
          Revisar
        </button>
      </div>
    </motion.div>
  );
}
