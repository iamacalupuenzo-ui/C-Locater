import { useState, useMemo } from 'react';
import { Video, VideoOff, MonitorCheck, Wifi, WifiOff, Car, Bike, Truck, Bus, Webcam } from 'lucide-react';
import { cn } from '../lib/utils';
import { useVehicles } from '../lib/VehicleContext';
import { useTheme } from '../lib/ThemeContext';
import { VEHICLE_CAMERAS } from '../lib/cameraData';
import { SearchInput } from './ui/SearchInput';
import { SegmentedControl } from './ui/SegmentedControl';
import { getCameraScene } from './live/cameraScenes';
import { WebcamFeed } from './live/WebcamFeed';

type SignalFilter = 'Todos' | 'Con señal' | 'Sin señal';

function VehicleTypeIcon({ type, className }: { type: string; className?: string }) {
  if (type === 'motorcycle') return <Bike  className={className} />;
  if (type === 'truck')      return <Truck className={className} />;
  if (type === 'bus')        return <Bus   className={className} />;
  return <Car className={className} />;
}

export function LiveVehicleList() {
  const { isDark } = useTheme();
  const vehicles   = useVehicles();

  const [query, setQuery]   = useState('');
  const [signal, setSignal] = useState<SignalFilter>('Todos');

  const withCameras = useMemo(
    () => vehicles.filter(v => (VEHICLE_CAMERAS[v.id] ?? []).length > 0),
    [vehicles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withCameras.filter(v => {
      const cameras   = VEHICLE_CAMERAS[v.id] ?? [];
      const hasOnline = cameras.some(c => c.isOnline);
      if (signal === 'Con señal'  && !hasOnline) return false;
      if (signal === 'Sin señal'  &&  hasOnline) return false;
      if (!q) return true;
      return v.plate.toLowerCase().includes(q) || v.name.toLowerCase().includes(q);
    });
  }, [withCameras, query, signal]);

  const openMonitor = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) window.dispatchEvent(new CustomEvent('monitorVehicle', { detail: vehicle }));
  };

  return (
    <div className={cn('flex flex-col h-full', isDark ? 'bg-zinc-950' : 'bg-neutral-50')}>

      {/* Header */}
      <div className={cn(
        'px-6 py-5 border-b shrink-0',
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200',
      )}>
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-0.5 tracking-wide">Monitoreo</p>
            <h1 className={cn('text-[22px] font-semibold tracking-tight', isDark ? 'text-zinc-100' : 'text-gray-900')}>
              En vivo
            </h1>
            <p className={cn('text-sm mt-0.5', isDark ? 'text-zinc-400' : 'text-gray-500')}>
              Unidades con cámara disponibles para monitoreo.
            </p>
          </div>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold shrink-0',
            isDark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
          )}>
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
            </span>
            Streaming activo
          </div>
        </div>

        {/* Filters row — mismo patrón que CaminosModule */}
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput
            placeholder="Buscar por placa o nombre..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            containerClassName="flex-1 min-w-[200px] max-w-xs"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400">Señal</label>
            <SegmentedControl
              options={[
                { value: 'Todos',     label: 'Todos'     },
                { value: 'Con señal', label: 'Con señal' },
                { value: 'Sin señal', label: 'Sin señal' },
              ]}
              value={signal}
              onChange={v => setSignal(v as SignalFilter)}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <VideoOff className={cn('w-10 h-10', isDark ? 'text-zinc-600' : 'text-slate-300')} />
            <p className={cn('text-[13px] font-medium', isDark ? 'text-zinc-500' : 'text-slate-400')}>
              {query ? `Sin resultados para "${query}"` : 'Sin unidades en esta categoría'}
            </p>
            {(query || signal !== 'Todos') && (
              <button
                onClick={() => { setQuery(''); setSignal('Todos'); }}
                className="text-[12px] text-brand hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {(query || signal !== 'Todos') && (
              <p className="text-xs text-gray-400 mb-4">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(vehicle => {
                const cameras    = VEHICLE_CAMERAS[vehicle.id] ?? [];
                const online     = cameras.filter(c => c.isOnline).length;
                const isActive   = vehicle.status === 'active';
                const primaryCam = cameras.find(c => c.isOnline) ?? cameras[0];
                const scene      = primaryCam ? getCameraScene(primaryCam.position) : null;
                const isWebcam   = primaryCam?.source === 'webcam';

                return (
                  <div
                    key={vehicle.id}
                    className={cn(
                      'flex flex-col rounded-xl border overflow-hidden transition-all',
                      isDark
                        ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm',
                    )}
                  >
                    {/* Preview cámara */}
                    <div
                      className="relative bg-zinc-900 cursor-pointer group"
                      style={{ aspectRatio: '16/9' }}
                      onClick={() => openMonitor(vehicle.id)}
                    >
                      {online > 0 && scene ? (
                        <>
                          {/* Scene background */}
                          {isWebcam ? (
                            <WebcamFeed className="absolute inset-0 w-full h-full" />
                          ) : (
                            <>
                              <div className="absolute inset-0" style={{ background: scene.background }} />
                              <div
                                className="absolute inset-0 opacity-[0.04]"
                                style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 4px)' }}
                              />
                              <div className="absolute inset-0" style={{ backgroundColor: scene.tint }} />
                              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)' }} />
                            </>
                          )}

                          {/* Live badge */}
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                            <span className="relative flex w-1.5 h-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-red-500" />
                            </span>
                            {isWebcam && <Webcam className="w-2.5 h-2.5 text-white/80" strokeWidth={2} />}
                            <span className="text-[9px] font-bold text-white">EN VIVO</span>
                          </div>

                          {/* Camera count */}
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Video className="w-2.5 h-2.5 text-white/70" strokeWidth={2} />
                            <span className="text-[9px] font-semibold text-white/80">{online}/{cameras.length}</span>
                          </div>

                          {/* Hover CTA */}
                          <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/10 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 bg-brand text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg">
                              <MonitorCheck className="w-3.5 h-3.5" strokeWidth={2} />
                              Monitorear
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <VideoOff className="w-7 h-7 text-zinc-600" strokeWidth={1.5} />
                          <span className="text-[10px] text-zinc-600">Sin señal</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 flex items-center gap-2.5">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                        isActive
                          ? (isDark ? 'bg-emerald-900/30 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200')
                          : (isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'),
                      )}>
                        <VehicleTypeIcon
                          type={vehicle.type}
                          className={cn('w-4 h-4', isActive ? 'text-emerald-500' : (isDark ? 'text-zinc-500' : 'text-slate-400'))}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('text-[12px] font-bold truncate', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                            {vehicle.plate}
                          </span>
                          <span className={cn('text-[10px] font-medium truncate', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                            {vehicle.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {isActive
                            ? <Wifi    className="w-3 h-3 text-emerald-500" strokeWidth={2} />
                            : <WifiOff className={cn('w-3 h-3', isDark ? 'text-zinc-600' : 'text-slate-400')} strokeWidth={2} />
                          }
                          <span className={cn('text-[10px]', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                            {online}/{cameras.length} cám. · {vehicle.speed}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => openMonitor(vehicle.id)}
                        className={cn(
                          'shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors',
                          online > 0
                            ? 'bg-brand text-white hover:bg-brand/90'
                            : (isDark ? 'bg-zinc-700 text-zinc-400' : 'bg-slate-100 text-slate-400'),
                        )}
                      >
                        <MonitorCheck className="w-3 h-3" strokeWidth={2} />
                        Ver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
