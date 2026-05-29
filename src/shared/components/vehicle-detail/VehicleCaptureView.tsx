import { cn } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import { VehicleDetailPanel } from './VehicleDetailPanel';
import { VehicleTrackingMap } from './VehicleTrackingMap';

interface VehicleCaptureViewProps {
  vehicle: Vehicle;
  onBack: () => void;
  isDark?: boolean;
}

export function VehicleCaptureView({ vehicle, onBack, isDark = false }: VehicleCaptureViewProps) {
  return (
    <div className={cn('flex w-full h-full overflow-hidden', isDark ? 'bg-zinc-950' : 'bg-neutral-100')}>

      {/* ── Panel lateral: info de captura ── */}
      <div className="w-[322px] flex-none flex flex-col gap-3 overflow-y-auto p-3 pr-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        <VehicleDetailPanel vehicle={vehicle} onBack={onBack} isDark={isDark} />
      </div>

      {/* ── Mapa ── */}
      <div className="flex-1 min-w-0 p-3 min-h-0">
        <div className={cn(
          'relative w-full h-full rounded-md overflow-hidden border',
          isDark ? 'border-zinc-800' : 'border-neutral-200',
        )}>
          <VehicleTrackingMap vehicle={vehicle} isDark={isDark} />
        </div>
      </div>

    </div>
  );
}
