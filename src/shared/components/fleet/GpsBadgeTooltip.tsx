import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LocateFixed } from 'lucide-react';
import type { UserRole } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';

interface GpsBadgeTooltipProps {
  vehicle: Vehicle;
  userRole?: UserRole;
  profile?: 'c-go' | 'c-loc';
  isDark?: boolean;
}

export function GpsBadgeTooltip({ vehicle, userRole = 'operator', profile = 'c-go', isDark = false }: GpsBadgeTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (showTooltip && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setPos({ top: rect.top - 32, left: rect.left + rect.width / 2 });
    } else {
      setPos(null);
    }
  }, [showTooltip]);

  if (profile === 'c-go' && userRole === 'client') return null;

  const visibleCount = (profile === 'c-go' && userRole === 'operator')
    ? (vehicle.gpsDevices?.filter(d => d.type !== 'contingencia').length ?? 0)
    : (vehicle.gpsCount ?? 0);

  const isAdminOrEsad = userRole === 'admin' || userRole === 'esad';
  if (isAdminOrEsad ? visibleCount < 1 : visibleCount <= 1) return null;

  return (
    <div
      ref={badgeRef}
      className="absolute -top-2 -left-2 z-[2] cursor-default"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`bg-brand text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border-[1.5px] shadow-sm ${isDark ? 'border-zinc-900' : 'border-white'}`}>
        <LocateFixed className="w-2 h-2" /> {visibleCount}
      </div>
      {pos && createPortal(
        <div
          style={{ top: pos.top, left: pos.left }}
          className="fixed -translate-x-1/2 pointer-events-none z-[10000]"
        >
          <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg relative">
            GPS Dispositivos
            <div className="absolute left-1/2 -translate-x-1/2 top-full border-[4px] border-transparent border-t-slate-800" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
