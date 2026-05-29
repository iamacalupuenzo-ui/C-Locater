import { motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import {
  RefreshCw, Check, Copy,
  Clock, MapPin, LocateFixed, Power, PowerOff,
  Bike, Car, Truck, Bus, Settings2,
} from 'lucide-react';
import { cn, formatLastSeen } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';

interface VehicleDetailPanelProps {
  vehicle: Vehicle;
  onBack: () => void;
  isDark?: boolean;
}

const STATUS_MAP = {
  active:  { label: 'Activo',    color: '#34C759' },
  stopped: { label: 'Detenido',  color: '#FF9500' },
  offline: { label: 'Sin señal', color: '#94a3b8' },
};

const VEHICLE_ICON = {
  motorcycle: Bike,
  truck:      Truck,
  bus:        Bus,
  machinery:  Settings2,
  car:        Car,
};

function Card({ children, className, isDark }: { children: ReactNode; className?: string; isDark: boolean }) {
  return (
    <div className={cn(
      'rounded-md border shadow-sm',
      isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
      className,
    )}>
      {children}
    </div>
  );
}

export function VehicleDetailPanel({ vehicle, onBack, isDark = false }: VehicleDetailPanelProps) {
  const status     = STATUS_MAP[vehicle.status];
  const ignition   = vehicle.gpsDevices?.[0]?.ignition ?? null;
  const ignitionOn = ignition === 'on';
  const ignColor   = ignitionOn ? '#34C759' : '#94a3b8';
  const VehicleIcon = VEHICLE_ICON[vehicle.type as keyof typeof VEHICLE_ICON] ?? Car;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(prev => prev === key ? null : prev), 1500);
  };

  const captureStages = [
    { id: 'inicio',     label: 'Inicio de captura', timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }), state: 'done'    as const },
    { id: 'en-proceso', label: 'En proceso',         timestamp: undefined,                                                                      state: 'active'  as const },
    { id: 'finalizado', label: 'Finalizado',          timestamp: undefined,                                                                      state: 'pending' as const },
  ];

  const infoRows = [
    { label: 'Placa',       value: vehicle.plate     },
    { label: 'Tipo',        value: vehicle.type      },
    { label: 'Propietario', value: vehicle.owner     },
    { label: 'Odómetro',    value: vehicle.odometer  },
    { label: 'Combustible', value: `${vehicle.fuel}%` },
    { label: 'Velocidad',   value: vehicle.speed     },
  ];

  const divider = cn('h-px shrink-0', isDark ? 'bg-zinc-800' : 'bg-neutral-100');

  const sectionLabel = cn(
    'text-[9.5px] font-semibold uppercase tracking-wider block mb-2.5',
    isDark ? 'text-zinc-500' : 'text-slate-400',
  );

  return (
    <>
      {/* ── Card 1: Header + Timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card isDark={isDark}>
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ background: `${status.color}15`, borderColor: `${status.color}30` }}
            >
              <VehicleIcon className="w-4.5 h-4.5" style={{ color: status.color }} strokeWidth={1.75} />
            </div>

            <div className="flex flex-col flex-1 min-w-0 gap-1.5">
              <div className="flex items-baseline gap-2">
                <span className={cn('text-[15px] font-bold tracking-tight leading-none', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                  {vehicle.plate.replace(/-/g, '')}
                </span>
                <span className={cn('text-[10px] font-semibold leading-none', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                  {vehicle.engineCode}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="inline-flex items-center gap-1 rounded-full px-2 py-[3px]" style={{ background: `${status.color}18` }}>
                  <LocateFixed className="w-2.5 h-2.5 shrink-0" style={{ color: status.color }} strokeWidth={2} />
                  <span className="text-[9.5px] font-semibold leading-none" style={{ color: status.color }}>{status.label}</span>
                </div>
                {ignition !== null && (
                  <div className="inline-flex items-center gap-1 rounded-full px-2 py-[3px]" style={{ background: `${ignColor}18` }}>
                    {ignitionOn
                      ? <Power    className="w-2.5 h-2.5 shrink-0" style={{ color: ignColor }} strokeWidth={2} />
                      : <PowerOff className="w-2.5 h-2.5 shrink-0" style={{ color: ignColor }} strokeWidth={2} />
                    }
                    <span className="text-[9.5px] font-semibold leading-none" style={{ color: ignColor }}>
                      {ignitionOn ? 'Encendido' : 'Apagado'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button className={cn(
              'w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0',
              isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600',
            )}>
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>

          <div className={divider} />

          <div className="px-4 py-3">
            <div className="flex items-start">
              {captureStages.map((stage, i) => {
                const isLast = i === captureStages.length - 1;
                const nextPending = captureStages[i + 1]?.state === 'pending';
                return (
                  <div key={stage.id} className="flex flex-col items-center flex-1 min-w-0">
                    <div className="flex items-center w-full">
                      <div className={cn('flex-1 h-[2px]',
                        i === 0 ? 'invisible' :
                        stage.state === 'pending' ? (isDark ? 'bg-zinc-700' : 'bg-slate-200') :
                        (isDark ? 'bg-emerald-600' : 'bg-emerald-500'),
                      )} />
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
                        stage.state === 'done'
                          ? (isDark ? 'bg-emerald-600 border-emerald-600' : 'bg-emerald-500 border-emerald-500')
                          : stage.state === 'active'
                            ? (isDark ? 'bg-zinc-900 border-emerald-500' : 'bg-white border-emerald-500')
                            : (isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'),
                      )}>
                        {stage.state === 'done'   && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        {stage.state === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                      </div>
                      <div className={cn('flex-1 h-[2px]',
                        isLast ? 'invisible' :
                        nextPending ? (isDark ? 'bg-zinc-700' : 'bg-slate-200') :
                        (isDark ? 'bg-emerald-600' : 'bg-emerald-500'),
                      )} />
                    </div>
                    <div className="flex flex-col items-center mt-1.5 px-1">
                      <span className={cn(
                        'text-[9.5px] font-semibold text-center leading-tight',
                        stage.state === 'pending'
                          ? (isDark ? 'text-zinc-600' : 'text-slate-300')
                          : (isDark ? 'text-zinc-300' : 'text-slate-700'),
                      )}>
                        {stage.label}
                      </span>
                      {stage.timestamp && (
                        <span className={cn('text-[8.5px] mt-0.5', isDark ? 'text-zinc-600' : 'text-slate-400')}>
                          {stage.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Card 2: Información del vehículo ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Card isDark={isDark}>
          <div className="px-4 py-3">
            <span className={sectionLabel}>Información del vehículo</span>
            <div className="flex flex-col gap-1.5">
              {infoRows.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className={cn('text-[11px]', isDark ? 'text-zinc-500' : 'text-slate-400')}>{label}</span>
                  <span className={cn('text-[11px] font-semibold text-right', isDark ? 'text-zinc-200' : 'text-slate-700')}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Card 3: Ubicación ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Card isDark={isDark}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className={sectionLabel}>Última posición</span>
              <button className={cn(
                'w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0',
                isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600',
              )}>
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" strokeWidth={2} />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className={cn('text-[11px] font-semibold leading-tight', isDark ? 'text-zinc-200' : 'text-slate-700')}>
                  {vehicle.address}
                </span>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyText(vehicle.coords, 'pos-coords'); }}
                    className={cn('group flex items-center gap-1 text-left text-[10.5px] font-medium tracking-wide transition-colors', isDark ? 'text-zinc-500 hover:text-blue-400' : 'text-slate-400 hover:text-brand')}
                  >
                    {vehicle.coords}
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" strokeWidth={1.75} />
                  </button>
                  {copiedKey === 'pos-coords' && (
                    <span className={cn('absolute -top-7 left-0 text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>Copiado ✓</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 ml-[22px]">
              <Clock className={cn('w-3 h-3 shrink-0', isDark ? 'text-zinc-600' : 'text-slate-300')} strokeWidth={1.75} />
              <span className={cn('text-[10.5px] font-medium', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                {formatLastSeen(vehicle.lastSeen)}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </>
  );
}
