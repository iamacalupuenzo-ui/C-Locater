import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Eye, EyeOff,
  Clock, LocateFixed, Power, ChevronDown,
  Bike, Car, Truck, Bus, Settings2,
  Gauge, Fuel, Ruler, User, Smartphone, Wifi, Radio,
  MapPin, RefreshCw,
} from 'lucide-react';
import { cn, formatLastSeen } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';

interface VehicleDetailPanelProps {
  vehicle: Vehicle;
  onBack: () => void;
  isDark?: boolean;
  captureStages?: { id: string; label: string; timestamp?: string; state: 'done' | 'active' | 'pending' }[];
  positionHistory?: { coords: string; dateTime: string; address: string; isLast: boolean }[];
  showPositions?: boolean;
  onTogglePositions?: () => void;
  gpsSwitchTo?: number;
}

const VEHICLE_ICON = {
  motorcycle: Bike,
  truck:      Truck,
  bus:        Bus,
  machinery:  Settings2,
  car:        Car,
};

const VCOLOR: Record<string, string> = {
  active:  '#34C759',
  stopped: '#FF9500',
  offline: '#94a3b8',
};

function getGpsBadge(reportStatus: string) {
  switch (reportStatus) {
    case 'reporting':    return { label: 'Transmitiendo', cls: 'text-emerald-500 bg-emerald-500/10', ping: true  };
    case 'no-signal':   return { label: 'Sin señal',      cls: 'text-amber-500 bg-amber-500/10',   ping: false };
    case 'low-signal':  return { label: 'Señal baja',     cls: 'text-orange-500 bg-orange-500/10', ping: false };
    case 'disconnected': return { label: 'Desconectado',  cls: 'text-slate-500 bg-slate-500/10',   ping: false };
    default:            return { label: 'Inactivo',        cls: 'text-slate-500 bg-slate-500/10',   ping: false };
  }
}

function Card({ children, className, isDark }: { children: ReactNode; className?: string; isDark: boolean }) {
  return (
    <div className={cn(
      'rounded-md border',
      isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
      className,
    )}>
      {children}
    </div>
  );
}

export function VehicleDetailPanel({ vehicle, onBack, isDark = false, captureStages, positionHistory, showPositions = true, onTogglePositions, gpsSwitchTo }: VehicleDetailPanelProps) {
  const devices = vehicle.gpsDevices ?? [];
  const [activeGpsIdx, setActiveGpsIdx] = useState(0);

  useEffect(() => {
    if (gpsSwitchTo !== undefined && gpsSwitchTo >= 0 && gpsSwitchTo < devices.length) {
      setActiveGpsIdx(gpsSwitchTo);
    }
  }, [gpsSwitchTo, devices.length]);
  const activeGpsIdxClamped = Math.min(activeGpsIdx, devices.length - 1);
  const gpsDevice = devices[activeGpsIdxClamped] ?? devices[0] ?? null;

  const vColor     = VCOLOR[vehicle.status] ?? '#94a3b8';
  const gpsBadge   = getGpsBadge(gpsDevice?.reportStatus ?? 'disconnected');
  const iconColor  = gpsBadge.ping ? '#10b981' : vColor;
  const ignition   = gpsDevice?.ignition ?? null;
  const ignitionOn = ignition === 'on';
  const VehicleIcon = VEHICLE_ICON[vehicle.type as keyof typeof VEHICLE_ICON] ?? Car;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [gpsDropdownOpen, setGpsDropdownOpen] = useState(false);
  const [gpsDropdownPos, setGpsDropdownPos] = useState({ top: 0, left: 0 });
  const gpsBtnRef = useRef<HTMLButtonElement>(null);
  const [visibleSections, setVisibleSections] = useState({
    info: true,
    gps: true,
  });
  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(prev => prev === key ? null : prev), 1500);
  };

  const toggleSection = (key: string) => {
    if (key === 'position') {
      onTogglePositions?.();
    } else {
      setVisibleSections(s => ({ ...s, [key]: !(s as any)[key] }));
    }
  };

  const infoRows = [
    { icon: User, label: 'Propietario', value: vehicle.owner, copyKey: 'owner' as const },
  ];

  const deviceFuelRaw   = gpsDevice?.fuel ?? vehicle.fuel;
  const deviceFuelPct   = parseInt(deviceFuelRaw, 10);
  const deviceFuelColor = deviceFuelPct > 60 ? 'text-emerald-500' : deviceFuelPct > 25 ? 'text-amber-500' : 'text-red-500';
  const deviceFuelBar   = deviceFuelPct > 60 ? 'bg-emerald-500'  : deviceFuelPct > 25 ? 'bg-amber-500'  : 'bg-red-500';

  const deviceGroup = gpsDevice?.groups?.[0];

  const divider = cn('h-px shrink-0', isDark ? 'bg-zinc-800' : 'bg-neutral-100');

  const sectionLabel = cn(
    'text-[9.5px] font-semibold uppercase tracking-wider block mb-2.5',
    isDark ? 'text-zinc-500' : 'text-slate-400',
  );

  return (
    <div className="flex flex-col gap-3">
      {/* ── Card 1: Header + Timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card isDark={isDark}>
          <div className={cn('flex items-center gap-2.5 px-4 py-3', isDark ? 'bg-zinc-900/96' : 'bg-white/94')}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ background: `${iconColor}15`, borderColor: `${iconColor}30` }}
            >
              <VehicleIcon className="w-[18px] h-[18px]" style={{ color: iconColor }} strokeWidth={1.75} />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className={cn('text-[13px] font-semibold leading-none', isDark ? 'text-zinc-100' : 'text-neutral-800')}>
                  {vehicle.plate.replace(/-/g, '')}
                </span>
                <span className={cn('text-[10px] font-medium leading-none', isDark ? 'text-zinc-500' : 'text-neutral-400')}>
                  {vehicle.engineCode}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 shrink-0', gpsBadge.cls)}>
                  <span className="relative flex items-center justify-center w-3.5 h-3.5">
                    {gpsBadge.ping && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />}
                    <LocateFixed className="w-3.5 h-3.5 relative" />
                  </span>
                  {gpsBadge.label}
                </span>
                {ignition !== null && (
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0',
                    ignitionOn ? 'text-emerald-500 bg-emerald-500/10' : (isDark ? 'text-zinc-500 bg-zinc-800' : 'text-slate-400 bg-slate-100'),
                  )}>
                    <Power className="w-2.5 h-2.5" />
                    {ignitionOn ? 'ON' : 'OFF'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className={cn('text-[15px] font-bold leading-none', isDark ? 'text-zinc-100' : 'text-neutral-800')}>
                {captureStages?.filter(s => s.state === 'done').length ?? 0}
              </span>
              <span className={cn('text-[10px] mt-0.5', isDark ? 'text-zinc-500' : 'text-neutral-400')}>etapas</span>
            </div>
          </div>

          {/* ── Toggles de secciones ── */}
          <div className={cn('px-4 py-2 flex flex-wrap gap-1.5 border-t', isDark ? 'border-zinc-800' : 'border-neutral-100')}>
            {([
              { key: 'info' as const,     label: 'Info' },
              { key: 'gps' as const,      label: 'GPS' },
              { key: 'position' as const, label: 'Posiciones' },
            ]).map(({ key, label }) => {
              const on = key === 'position' ? showPositions : visibleSections[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleSection(key)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] font-semibold transition-all',
                    on
                      ? cn('ring-1', isDark ? 'ring-zinc-600 bg-zinc-800 text-zinc-200' : 'ring-slate-300 bg-white text-slate-700')
                      : cn(isDark ? 'text-zinc-600 bg-zinc-800/30' : 'text-slate-400 bg-slate-100/50'),
                  )}
                >
                  {on ? <Eye className="w-3 h-3" strokeWidth={1.5} /> : <EyeOff className="w-3 h-3" strokeWidth={1.5} />}
                  {label}
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* ── Card 2: Dispositivo GPS ── */}
      {visibleSections.gps && gpsDevice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <Card isDark={isDark}>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className={sectionLabel}>Dispositivo GPS</span>
                <div className="relative">
                  <button
                    onClick={() => {
                      const lines: string[] = [
                        `Tipo: ${gpsDevice.type}`,
                        `IMEI: ${gpsDevice.imei}`,
                        `Línea: ${gpsDevice.linea}`,
                      ];
                      if (deviceGroup) {
                        lines.push(`Grupo: ${deviceGroup.name}${deviceGroup.subgroup ? ` — ${deviceGroup.subgroup}` : ''}`);
                      }
                      lines.push(
                        `Odómetro: ${vehicle.odometer}`,
                        `Velocidad: ${gpsDevice.speed}`,
                        `Combustible: ${deviceFuelRaw}`,
                        `Conexión: ${formatLastSeen(gpsDevice.lastSeen)}`,
                        `Alarmas: ${gpsDevice.alarmCount}`,
                      );
                      copyText(lines.join('\n'), 'gps-card');
                    }}
                    className={cn(
                      'relative flex items-center justify-center w-6 h-6 rounded-md transition-colors',
                      isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700',
                    )}
                  >
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {copiedKey === 'gps-card' && (
                      <span className={cn('absolute -top-8 right-0 text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>Copiado ✓</span>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 min-h-[26px]">
                  <Wifi className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Tipo</span>
                  {devices.length > 1 ? (
                    <div className="relative flex-1 min-w-0">
                      <button
                        ref={gpsBtnRef}
                        onClick={() => { if (!gpsDropdownOpen && gpsBtnRef.current) { const r = gpsBtnRef.current.getBoundingClientRect(); setGpsDropdownPos({ top: r.bottom + 4, left: r.left }); } setGpsDropdownOpen(prev => !prev); }}
                        className={cn('flex items-center gap-1 w-full text-left text-[11px] font-semibold capitalize', isDark ? 'text-zinc-200' : 'text-slate-700')}
                      >
                        <span className="flex-1 truncate">{gpsDevice.type}</span>
                        <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform duration-200', gpsDropdownOpen && 'rotate-180', isDark ? 'text-zinc-400' : 'text-slate-400')} strokeWidth={1.5} />
                      </button>
                      {gpsDropdownOpen && createPortal(
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setGpsDropdownOpen(false)} />
                          <div style={{ position: 'fixed', top: gpsDropdownPos.top, left: gpsDropdownPos.left }} className={cn('z-50 rounded-md border py-1 shadow-lg', isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200')}>
                            {devices.map((d, i) => (
                              <button key={d.imei} onClick={() => { setActiveGpsIdx(i); setGpsDropdownOpen(false); }} className={cn('w-full text-left px-3 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap', i === activeGpsIdxClamped ? (isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-slate-100 text-slate-800') : (isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'))}>{d.type} — {d.imei.slice(-6)}</button>
                            ))}
                          </div>
                        </>,
                        document.body
                      )}
                    </div>
                  ) : (
                    <span className={cn('text-[11px] font-semibold capitalize', isDark ? 'text-zinc-200' : 'text-slate-700')}>{gpsDevice.type}</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 min-h-[26px]">
                  <Smartphone className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>IMEI</span>
                  <div className="relative flex-1 min-w-0">
                    <button onClick={(e) => { e.stopPropagation(); copyText(gpsDevice.imei, 'imei'); }} className={cn('group flex items-center gap-1 text-left transition-colors', isDark ? 'text-zinc-200 hover:text-blue-400' : 'text-slate-700 hover:text-brand')}>
                      <span className="text-[11px] font-mono font-semibold">{gpsDevice.imei}</span>
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" strokeWidth={1.5} />
                    </button>
                    {copiedKey === 'imei' && (<span className={cn('absolute -top-7 left-0 text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>Copiado ✓</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 min-h-[26px]">
                  <Smartphone className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Línea</span>
                  <div className="relative flex-1 min-w-0">
                    <button onClick={(e) => { e.stopPropagation(); copyText(gpsDevice.linea, 'linea'); }} className={cn('group flex items-center gap-1 text-left transition-colors', isDark ? 'text-zinc-200 hover:text-blue-400' : 'text-slate-700 hover:text-brand')}>
                      <span className="text-[11px] font-semibold">{gpsDevice.linea}</span>
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" strokeWidth={1.5} />
                    </button>
                    {copiedKey === 'linea' && (<span className={cn('absolute -top-7 left-0 text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>Copiado ✓</span>)}
                  </div>
                </div>
                {deviceGroup && (
                  <div className="flex items-center gap-2.5 min-h-[26px]">
                    <Radio className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                    <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Grupo</span>
                    <span className={cn('text-[11px] font-semibold', isDark ? 'text-zinc-200' : 'text-slate-700')}>{deviceGroup.name}{deviceGroup.subgroup ? ` — ${deviceGroup.subgroup}` : ''}</span>
                  </div>
                )}
                <div className={cn('my-1.5', divider)} />
                <div className="flex items-center gap-2.5 min-h-[26px]">
                  <Gauge className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Odómetro</span>
                  <span className={cn('text-[11px] font-semibold', isDark ? 'text-zinc-200' : 'text-slate-700')}>{vehicle.odometer}</span>
                </div>
                <div className="flex items-center gap-2.5 min-h-[26px]">
                  <Ruler className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Velocidad</span>
                  <span className={cn('text-[11px] font-semibold', isDark ? 'text-zinc-200' : 'text-slate-700')}>{gpsDevice.speed}</span>
                </div>
                <div className="flex items-center gap-2.5 min-h-[26px]">
                  <Fuel className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Combustible</span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-neutral-200/60 dark:bg-zinc-700/60 max-w-[72px]">
                      <div className={cn('h-full rounded-full transition-all', deviceFuelBar)} style={{ width: `${deviceFuelPct}%` }} />
                    </div>
                    <span className={cn('text-[11px] font-semibold', deviceFuelColor)}>{deviceFuelRaw}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 min-h-[26px]">
                  <Clock className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Conexión</span>
                  <span className={cn('text-[11px] font-semibold', isDark ? 'text-zinc-200' : 'text-slate-700')}>{formatLastSeen(gpsDevice.lastSeen)}</span>
                </div>
                <div className="flex items-center gap-2.5 min-h-[26px]">
                  <Power className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Alarmas</span>
                  <span className={cn('text-[11px] font-semibold', gpsDevice.alarmCount > 0 ? 'text-red-500' : (isDark ? 'text-zinc-200' : 'text-slate-700'))}>{gpsDevice.alarmCount}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Card 3: Información del vehículo ── */}
      {visibleSections.info && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.07 }}
      >
        <Card isDark={isDark}>
          <div className="px-4 py-3">
            <span className={sectionLabel}>Información del vehículo</span>
            <div className="flex flex-col">
              {infoRows.map(({ icon: Icon, label, value, copyKey }) => (
                <div key={label} className="flex items-center gap-2.5 min-h-[28px]">
                  <Icon className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                  <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>{label}</span>
                  <div className="relative flex-1 min-w-0">
                    <button onClick={(e) => { e.stopPropagation(); copyText(value, copyKey); }} className={cn('group flex items-center gap-1 text-left transition-colors', isDark ? 'text-zinc-200 hover:text-blue-400' : 'text-slate-700 hover:text-brand')}>
                      <span className="text-[11px] font-semibold">{value}</span>
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" strokeWidth={1.5} />
                    </button>
                    {copiedKey === copyKey && (<span className={cn('absolute -top-7 left-0 text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>Copiado ✓</span>)}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2.5 min-h-[28px]">
                <Copy className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Placa</span>
                <div className="relative flex-1 min-w-0">
                  <button onClick={(e) => { e.stopPropagation(); copyText(vehicle.plate.replace(/-/g, ''), 'plate'); }} className={cn('group flex items-center gap-1 text-left transition-colors', isDark ? 'text-zinc-200 hover:text-blue-400' : 'text-slate-700 hover:text-brand')}>
                    <span className="text-[11px] font-semibold">{vehicle.plate.replace(/-/g, '')}</span>
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" strokeWidth={1.5} />
                  </button>
                  {copiedKey === 'plate' && (<span className={cn('absolute -top-7 left-0 text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>Copiado ✓</span>)}
                </div>
              </div>
              <div className="flex items-center gap-2.5 min-h-[28px]">
                <Settings2 className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-300')} strokeWidth={1.5} />
                <span className={cn('text-[11px] w-20 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')}>Código Motor</span>
                <span className={cn('text-[11px] font-semibold', isDark ? 'text-zinc-200' : 'text-slate-700')}>{vehicle.engineCode}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      )}

    </div>
  );
}
