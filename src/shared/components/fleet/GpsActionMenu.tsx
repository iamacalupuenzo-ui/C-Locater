import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Route, Lock, Zap, Copy } from 'lucide-react';
import { cn, formatLastSeen } from '../../lib/utils';
import type { UserRole } from '../../lib/utils';
import type { Vehicle, GpsDevice } from '../../lib/data';

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
}

export function GpsActionMenu({
  triggerRef, onClose, vehicle, gpsName, gpsDevice, onShowToast,
  userRole = 'admin', profile = 'c-go',
}: GpsActionMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; openUp: boolean } | null>(null);

  const isOperatorCGo = profile === 'c-go' && userRole === 'operator';
  const menuHeight = isOperatorCGo ? 120 : 200;

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

  return createPortal(
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      style={{ top: pos.top, left: pos.left, width: 196 }}
      className="fixed z-[10000] bg-white border border-gray-100 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {GPS_ACTIONS
        .filter(a => !(isOperatorCGo && a.label === 'Comando'))
        .map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => onClose()}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      {!isOperatorCGo && (
        <>
          <div className="mx-3 my-1 h-px bg-gray-100" />
          <button
            onClick={handleCopyInfo}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.75} />
            Copiar información
          </button>
        </>
      )}
    </motion.div>,
    document.body
  );
}

// Needed for AnimatePresence in parent
export { AnimatePresence };
