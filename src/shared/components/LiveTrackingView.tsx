import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Video, VideoOff, Power, Bike, Car, Truck, Bus, Settings2, LocateFixed, MapPin, Milestone, Gauge, Battery, Bell } from 'lucide-react';
import { cn, formatLastSeenWithSecs } from '../lib/utils';
import { getBatteryColor, getVehicleGpsStyle } from './fleet/fleetUtils';
import type { Vehicle } from '../lib/data';
import { useVehicles } from '../lib/VehicleContext';
import { useTheme } from '../lib/ThemeContext';
import { getCamerasForVehicle } from '../lib/cameraData';
import { CameraPanel } from './live/CameraPanel';
import { createCustomIcon } from '../lib/mapIcons';

const VEHICLE_ICON = { motorcycle: Bike, truck: Truck, bus: Bus, machinery: Settings2, car: Car };

function VehicleFollower({ position }: { position: [number, number] }) {
  const map = useMap();
  const firstRef = useRef(true);
  useEffect(() => {
    if (firstRef.current) {
      map.setView(position, 16, { animate: false });
      firstRef.current = false;
    } else {
      map.panTo(position, { animate: true, duration: 1.5 });
    }
  }, [map, position]);
  return null;
}

interface LiveTrackingViewProps {
  vehicle: Vehicle;
  onBack: () => void;
}

export function LiveTrackingView({ vehicle: initialVehicle, onBack }: LiveTrackingViewProps) {
  const { isDark } = useTheme();
  const vehicles   = useVehicles();
  const vehicle    = vehicles.find(v => v.id === initialVehicle.id) ?? initialVehicle;
  const cameras    = getCamerasForVehicle(vehicle.id);
  const hasCameras = cameras.length > 0;
  const marker     = createCustomIcon(vehicle, true, isDark);

  const alarmVal    = vehicle.alarmCount ?? 0;
  const alarmLabel  = alarmVal === 0 ? 'Sin ev.' : `${alarmVal} ev.`;

  const stats = [
    { icon: Milestone, value: vehicle.odometer, label: 'Odómetro',    colorClass: null as string | null, isAlarm: false },
    { icon: Gauge,     value: vehicle.speed,    label: 'Velocidad',   colorClass: null as string | null, isAlarm: false },
    { icon: Battery,   value: vehicle.fuel,     label: 'Combustible', colorClass: getBatteryColor(vehicle.fuel), isAlarm: false },
    { icon: Bell,      value: alarmLabel,       label: 'Alertas',     colorClass: null as string | null, isAlarm: alarmVal > 0 },
  ];

  const VehicleIcon = VEHICLE_ICON[vehicle.type as keyof typeof VEHICLE_ICON] ?? Car;
  const gpsStyle    = getVehicleGpsStyle(vehicle, isDark);

  const tileUrl = isDark
    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className={cn('flex w-full h-full overflow-hidden', isDark ? 'bg-zinc-950' : 'bg-neutral-100')}>

      {/* ── Panel izquierdo: info del vehículo + cámaras ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 pr-1.5 gap-3.5">

        {/* Card 1 — Info de la unidad */}
        <div className={cn(
          'rounded-xl border shrink-0',
          isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
        )}>
          <div className="flex items-center gap-2.5 px-4 py-3">

            {/* Ícono del vehículo con badges GPS e ignición superpuestos */}
            <div className={cn('border flex items-center justify-center relative shrink-0 w-[28px] h-[28px] rounded-lg', gpsStyle.bg, gpsStyle.border)}>
              <VehicleIcon className={cn('w-[14px] h-[14px]', gpsStyle.icon)} strokeWidth={1.75} />

              {/* Badge GPS — arriba izquierda */}
              <div className="absolute -top-2 -left-2">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  {gpsStyle.isReporting && (
                    <span className={cn('absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping', gpsStyle.ping)} />
                  )}
                  <div className={cn('relative w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shadow-sm', gpsStyle.solid, isDark ? 'border-zinc-900' : 'border-white')}>
                    <LocateFixed className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>

              {/* Badge ignición — abajo derecha */}
              <div className={cn(
                'absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shadow-sm group/ign cursor-default',
                vehicle.status === 'active' ? 'bg-emerald-500' : 'bg-red-500',
                isDark ? 'border-zinc-900' : 'border-white',
              )}>
                <Power className="w-2.5 h-2.5 text-white" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/ign:opacity-100 translate-y-1 group-hover/ign:translate-y-0 transition-all duration-200 pointer-events-none z-[100]">
                  <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                    {vehicle.status === 'active' ? 'Encendido' : 'Apagado'}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
                </div>
              </div>
            </div>

            {/* Identidad: placa + código / fecha última ubicación */}
            <div className="flex flex-col shrink-0 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className={cn('text-[13px] font-bold tracking-tight leading-none', isDark ? 'text-zinc-50' : 'text-slate-900')}>
                  {vehicle.plate.replace(/-/g, '')}
                </span>
                <span className={cn('text-[10px] font-medium leading-none', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                  {vehicle.engineCode}
                </span>
              </div>
              <span className={cn('text-[11px] font-medium leading-none whitespace-nowrap mt-1.5', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                {formatLastSeenWithSecs(vehicle.lastSeen)}
              </span>
            </div>

            {/* Divisor vertical */}
            <div className={cn('self-stretch w-px shrink-0 mx-1', isDark ? 'bg-zinc-800' : 'bg-neutral-100')} />

            {/* Ubicación + coords + timestamp */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <MapPin className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', isDark ? 'text-blue-400' : 'text-brand')} strokeWidth={1.75} />
              <div className="flex flex-col gap-1 min-w-0">
                <span className={cn('text-[11.5px] font-semibold leading-tight', isDark ? 'text-zinc-100' : 'text-slate-800')}>
                  {vehicle.address}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(`https://www.google.com/maps?q=${vehicle.coords}`)}
                  className={cn('group flex items-center gap-1 text-left text-[10.5px] font-medium tracking-wide transition-colors w-fit', isDark ? 'text-zinc-500 hover:text-blue-400' : 'text-slate-400 hover:text-brand')}
                >
                  {vehicle.coords}
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                </button>
              </div>
            </div>

            {/* Divisor vertical */}
            <div className={cn('self-stretch w-px shrink-0 mx-1', isDark ? 'bg-zinc-800' : 'bg-neutral-100')} />

            {/* Stats — mismo estándar Zona 2.5 del acordeón */}
            <div className="flex items-center shrink-0">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-stretch">
                  {i > 0 && <div className={cn('w-px self-stretch mx-0.5', isDark ? 'bg-zinc-700' : 'bg-slate-100')} />}
                  <div className="flex flex-col items-center gap-1 px-2.5 relative group cursor-default">
                    {stat.isAlarm ? (
                      <div className="relative">
                        <Bell className="w-3.5 h-3.5 text-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
                        {alarmVal > 0 && (
                          <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-orange-500 text-white text-[8px] font-bold leading-none">
                            {alarmVal > 99 ? '99+' : alarmVal}
                          </span>
                        )}
                      </div>
                    ) : (
                      <stat.icon className={cn('w-3.5 h-3.5 opacity-80 group-hover:opacity-100 transition-opacity', stat.colorClass ?? (isDark ? 'text-blue-400' : 'text-brand'))} strokeWidth={1.75} />
                    )}
                    <span className={cn(
                      'text-[11px] font-semibold tabular-nums whitespace-nowrap',
                      stat.isAlarm ? 'text-orange-500' : (stat.colorClass ?? (isDark ? 'text-zinc-200' : 'text-slate-700')),
                    )}>
                      {stat.value}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                      <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">{stat.label}</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[4px] border-transparent border-t-slate-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Card 2 — Cámaras */}
        <div className={cn(
          'flex-1 min-h-0 rounded-xl border overflow-hidden',
          isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
        )}>
          {hasCameras ? (
            <CameraPanel cameras={cameras} vehiclePlate={vehicle.plate} showCollapseBtn={false} isDark={isDark} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', isDark ? 'bg-zinc-800' : 'bg-slate-100')}>
                <VideoOff className={cn('w-5 h-5', isDark ? 'text-zinc-600' : 'text-slate-400')} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className={cn('text-[13px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>Sin cámaras</p>
                <p className={cn('text-[11px] mt-0.5', isDark ? 'text-zinc-600' : 'text-slate-400')}>
                  Esta unidad no tiene cámaras configuradas
                </p>
              </div>
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]',
                isDark ? 'bg-zinc-800/60 text-zinc-500' : 'bg-slate-100 text-slate-400',
              )}>
                <Video className="w-3 h-3" strokeWidth={2} />
                Solo seguimiento GPS
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mapa ── */}
      <div className="w-[45%] flex-none min-h-0 relative p-3 pl-1.5">
        <div className="w-full h-full rounded-xl overflow-hidden shadow-sm">
          <MapContainer
            center={vehicle.position as [number, number]}
            zoom={16}
            zoomControl={true}
            className="w-full h-full"
            style={{ background: isDark ? '#18181b' : '#f8f9fa' }}
          >
            <TileLayer url={tileUrl} attribution="" />
            <VehicleFollower position={vehicle.position as [number, number]} />
            <Marker position={vehicle.position as [number, number]} icon={marker} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
