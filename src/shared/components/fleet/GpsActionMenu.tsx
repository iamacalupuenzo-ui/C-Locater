import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Route, Lock, Zap, Copy, Pin, PinOff } from 'lucide-react';
import { cn, formatLastSeen } from '../../lib/utils';
import type { UserRole } from '../../lib/utils';
import type { Vehicle, GpsDevice } from '../../lib/data';
import { useTheme } from '../../lib/ThemeContext';

const GPS_ACTIONS = [
  { icon: MapPin, label: 'Ubicación' },
  { icon: Route,  label: 'Viajes'    },
  { icon: Lock,   label: 'Parqueo'   },
  { icon: Zap,    label: 'Comando'   },
];

interface GpsActionMenuProps {
  triggerRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  vehicle: Vehicle;
  gpsName: string;
  gpsDevice: GpsDevice;
  onShowToast: (msg: string) => void;
  userRole?: UserRole;
  profile?: 'c-go' | 'c-loc';
  onFlyTo?: () => void;
  onTrips?: () => void;
  onParqueo?: () => void;
  onCommand?: () => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

export function GpsActionMenu({
  triggerRef, onClose, vehicle, gpsName, gpsDevice, onShowToast,
  userRole = 'admin', profile = 'c-go',
  onFlyTo, onTrips, onParqueo, onCommand, onTogglePin, isPinned = false,
}: GpsActionMenuProps) {
  const { isDark } = useTheme();
  const isCloc = profile === 'c-loc';
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; openUp: boolean } | null>(null);

  const isOperatorCGo = profile === 'c-go' && userRole === 'operator';
  const hasPinOption = !!onTogglePin;
  const menuHeight = isOperatorCGo
    ? (hasPinOption ? 172 : 120)
    : (hasPinOption ? 250 : 200);

  const handleCopyInfo = () => {
    const lines = [
      `Propietario: ${vehicle.owner ?? '-'}`,
      `Placa: ${vehicle.plate}`,
      `Alias: ${vehicle.name}`,
      `Código: ${vehicle.id.toUpperCase()}`,
      ``,
      `Ubicación: ${vehicle.address}`,
      `Coordenadas: ${vehicle.coords}`,
      `Último reporte GPS: ${formatLastSeen(gpsDevice.lastSeen)}`,
      ``,
      `Velocidad: ${gpsDevice.speed}`,
      `Batería: ${gpsDevice.fuel}`,
      `Eventos: ${gpsDevice.alarmCount}`,
      ``,
      `Dispositivo: ${gpsName}`,
      `IMEI: ${gpsDevice.imei}`,
      `Línea: ${gpsDevice.linea}`,
      `Estado GPS: ${gpsDevice.reportStatus === 'reporting' ? 'Reportando' : 'Inactivo'}`,
      `Ignición vehículo: ${gpsDevice.ignition === 'on' ? 'ON' : 'OFF'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    onShowToast('Información copiada al portapapeles');
    onClose();
  };

  React.useEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 196;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 8;
    let left = rect.right - menuWidth;
    if (left < 8) left = rect.left;
    setPos({ top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4, left, openUp });
  }, [triggerRef, menuHeight]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, triggerRef]);

  if (!pos) return null;

  const itemCls = cn(
    'w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left',
    isDark ? 'text-zinc-300 hover:bg-zinc-700' : 'text-slate-600 hover:bg-slate-100'
  );

  const iconCls = cn('w-3 h-3 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400');

  const dividerCls = cn('h-px mx-1 my-0.5', isDark ? 'bg-zinc-700' : 'bg-slate-200/80');

  return createPortal(
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      style={{ top: pos.top, left: pos.left, minWidth: 180 }}
      className={cn(
        'fixed z-[10000] rounded-lg border shadow-[0_8px_24px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col gap-[2px] p-[2px]',
        isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200/80'
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {GPS_ACTIONS
        .filter(a => !(isOperatorCGo && a.label === 'Comando'))
        .map(({ icon: Icon, label }) => {
          const handler =
            label === 'Ubicación' ? () => { onFlyTo?.(); onClose(); } :
            label === 'Viajes'    ? () => { onTrips?.();   onClose(); } :
            label === 'Parqueo'   ? () => { onParqueo?.(); onClose(); } :
            label === 'Comando'   ? () => { onCommand?.(); onClose(); } :
            () => onClose();
          return (
            <button key={label} onClick={handler} className={itemCls}>
              <Icon className={iconCls} strokeWidth={1.75} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      {!isOperatorCGo && (
        <>
          <div className={dividerCls} />
          <button onClick={handleCopyInfo} className={itemCls}>
            <Copy className={iconCls} strokeWidth={1.75} />
            <span className="text-[11px] font-medium">Copiar información</span>
          </button>
        </>
      )}
      {hasPinOption && (
        <>
          <div className={dividerCls} />
          <button
            onClick={() => { onTogglePin!(); onClose(); }}
            className={cn(itemCls, isPinned ? 'text-brand hover:bg-brand/5' : '')}
          >
            {isPinned
              ? <PinOff className="w-3 h-3 text-brand shrink-0" strokeWidth={1.75} />
              : <Pin className={iconCls} strokeWidth={1.75} />
            }
            <span className="text-[11px] font-medium">{isPinned ? 'Desanclar' : 'Fijar arriba'}</span>
          </button>
        </>
      )}
    </motion.div>,
    document.body
  );
}

// Needed for AnimatePresence in parent
export { AnimatePresence };
