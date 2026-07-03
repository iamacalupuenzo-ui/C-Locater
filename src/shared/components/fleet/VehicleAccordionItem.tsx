import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Copy, ChevronDown, ChevronRight, Pencil, Power, Share2,
  Gauge, Compass, Milestone, Battery, Bell, Lock, LocateFixed,
  Route, FileText, Navigation, Zap, X, Car, Bike, Truck, Bus,
  Terminal, MoreVertical, Pin, MonitorCheck,
} from 'lucide-react';
import { cn, formatLastSeen, formatLastSeenMini, formatLastSeenMiniSecs, formatLastSeenWithSecs } from '../../lib/utils';
import type { UserRole } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import { Modal, Button } from '../ui';
import { GpsBadgeTooltip } from './GpsBadgeTooltip';
import { GpsPopover } from './GpsPopover';
import { GpsActionMenu, AnimatePresence as GpsAnimatePresence } from './GpsActionMenu';
import { SharePopover } from './SharePopover';
import { getBatteryColor, getVehicleGpsStyle } from './fleetUtils';

function EsadActionMenu({
  triggerRef,
  onClose,
  onFlyTo,
  onTrips,
  onParqueo,
  onCommand,
  vehicle,
}: {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onFlyTo: () => void;
  onTrips: () => void;
  onParqueo: () => void;
  onCommand: () => void;
  vehicle: Vehicle;
}) {
  const rect = triggerRef.current?.getBoundingClientRect();
  const top  = rect ? rect.bottom + 6 : 0;
  const right = rect ? window.innerWidth - rect.right : 0;

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, triggerRef]);

  const items = [
    { icon: MapPin,       label: 'Ubicación', onClick: () => { onFlyTo();   onClose(); } },
    { icon: Route,        label: 'Viajes',    onClick: () => { onTrips();   onClose(); } },
    { icon: Lock,         label: 'Parqueo',   onClick: () => { onParqueo(); onClose(); } },
    { icon: MonitorCheck, label: 'Monitoreo', onClick: () => {
      window.dispatchEvent(new CustomEvent('monitorVehicle', { detail: vehicle }));
      onClose();
    }},
    { icon: Zap,          label: 'Comando',   onClick: () => { onCommand(); onClose(); } },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.12 }}
      style={{ position: 'fixed', top, right, zIndex: 9999 }}
      className="w-44 bg-white/90 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] py-1 overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map(({ icon: Icon, label, onClick }) => (
        <button
          key={label}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-[12px] font-medium text-slate-700 hover:bg-brand/5 hover:text-brand transition-colors"
        >
          <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          {label}
        </button>
      ))}
    </motion.div>
  );
}

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  if (type === 'motorcycle') return <Bike className={className} />;
  if (type === 'truck')      return <Truck className={className} />;
  if (type === 'bus')        return <Bus className={className} />;
  return <Car className={className} />;
}

interface VehicleAccordionItemProps {
  vehicle: Vehicle;
  isExpanded: boolean;
  onToggle: (vehicleId: string) => void;
  onFlyTo: (position: [number, number]) => void;
  onShowToast: (msg: string) => void;
  userRole: UserRole;
  isPinned?: boolean;
  onTogglePin?: (vehicleId: string) => void;
  isDark?: boolean;
  highlighted?: boolean;
  key?: React.Key;
}

export function VehicleAccordionItem({
  vehicle, isExpanded, onToggle, onFlyTo, onShowToast, userRole,
  isPinned = false, onTogglePin, isDark = false, highlighted = false,
}: VehicleAccordionItemProps) {
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [showTripsModal,   setShowTripsModal]   = useState(false);
  const [showParqueoModal, setShowParqueoModal] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(vehicle.name);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showShareHistory, setShowShareHistory] = useState(false);
  const [showGpsPopover, setShowGpsPopover] = useState(false);
  const [showEsadMenu, setShowEsadMenu] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showTripsScrollHint, setShowTripsScrollHint] = useState(false);

  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const gpsButtonRef   = useRef<HTMLButtonElement>(null);
  const esadMenuRef    = useRef<HTMLButtonElement>(null);
  const tripsListRef   = useRef<HTMLDivElement>(null);

  const checkTripsScroll = React.useCallback(() => {
    const el = tripsListRef.current;
    if (!el) return;
    setShowTripsScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  React.useEffect(() => {
    if (showTripsModal) setTimeout(checkTripsScroll, 320);
    else setShowTripsScrollHint(false);
  }, [showTripsModal, checkTripsScroll]);

  const isAdminOrEsad = userRole === 'admin' || userRole === 'esad';
  const gpsStyle = getVehicleGpsStyle(vehicle, isDark);
  // En dark mode el azul brand (#0052CC) tiene bajo contraste — se usa blue-400 (#60A5FA)
  const brandCls   = isDark ? 'text-blue-400'                          : 'text-brand';
  const brandHover = isDark ? 'hover:text-blue-400 hover:bg-blue-400/10' : 'hover:text-brand hover:bg-brand/5';

  const visibleGpsCount = vehicle.gpsCount ?? 0;

  const showGpsButton = visibleGpsCount > 0
    && userRole !== 'client'
    && (isAdminOrEsad || visibleGpsCount > 1);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  React.useEffect(() => {
    if (!isExpanded) { setShowSharePopover(false); setShowEsadMenu(false); setShowGpsPopover(false); }
  }, [isExpanded]);

  // Notify FleetMap when the GPS layer should be shown or hidden
  const prevShowGpsRef = React.useRef(false);
  React.useEffect(() => {
    if (showGpsPopover === prevShowGpsRef.current) return;
    prevShowGpsRef.current = showGpsPopover;
    window.dispatchEvent(new CustomEvent('vehicleGpsLayerToggle', {
      detail: { vehicleId: showGpsPopover ? vehicle.id : null },
    }));
    if (showGpsPopover) {
      window.dispatchEvent(new CustomEvent('collapseSidebar'));
    }
  }, [showGpsPopover, vehicle.id]);

  return (
    <div
      id={`vehicle-item-${vehicle.id}`}
      className={cn(
        'relative flex flex-col transition-all',
        'mx-3 mb-2 rounded-[10px] border transition-all',
        isExpanded
          ? (isDark ? 'border-zinc-700 bg-zinc-800/60' : 'bg-white border-blue-200 shadow-[0_2px_12px_rgba(59,130,246,0.08)]')
          : highlighted
            ? (isDark ? 'border-zinc-700 bg-zinc-800/40' : 'bg-white border-blue-400')
            : (isDark ? 'border-transparent hover:border-zinc-700 hover:bg-zinc-800/40' : 'bg-white border-transparent hover:border-blue-200'),
      )}
    >
      {isPinned && (
        <Pin className={cn('absolute top-2 right-2 w-3.5 h-3.5 z-10 rotate-45', isDark ? 'text-zinc-200 fill-zinc-200' : 'text-neutral-900 fill-neutral-900')} />
      )}
      {/* ZONA 1 — IDENTIDAD */}
      <div
        className="flex flex-col cursor-pointer group py-3 px-3"
        onClick={() => { if (!isEditingAlias) onToggle(vehicle.id); }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
            {/* Ícono de vehículo — color según estado GPS principal */}
            <div className={cn('border flex items-center justify-center relative shrink-0 w-[28px] h-[28px] rounded-lg', gpsStyle.bg, gpsStyle.border)}>
              <VehicleIcon type={vehicle.type} className={cn('w-[14px] h-[14px]', gpsStyle.icon)} />
              {(userRole === 'esad' || userRole === 'client') ? (
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
              ) : (
                <GpsBadgeTooltip vehicle={vehicle} userRole={userRole} isDark={isDark} />
              )}
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

            {/* Nombre + segunda línea */}
            <div className="flex flex-col flex-1 min-w-0">
              {userRole === 'esad' ? (
                <div className="flex flex-col gap-1.5 min-w-0">
                  {/* esad — Línea 1: placa (o primeros 6 del engineCode) + engineCode completo al lado */}
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className={cn('font-bold tracking-tight leading-none shrink-0', 'text-[13px]', isDark ? 'text-zinc-50' : 'text-slate-900')}>
                      {vehicle.plate ? vehicle.plate.replace(/-/g, '') : vehicle.engineCode.slice(0, 6)}
                    </span>
                    <span className={cn('text-[10px] font-medium leading-none truncate', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                      {vehicle.engineCode}
                    </span>
                  </div>
                  {/* esad — Línea 2: fecha larga, siempre visible */}
                  <span className={cn('text-[11px] font-medium leading-none whitespace-nowrap', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                    {formatLastSeenWithSecs(vehicle.lastSeen ?? '')}
                  </span>
                </div>
              ) : userRole === 'admin' ? (
                <>
                  {/* admin — Línea 1: placa sin guiones */}
                  <div className={cn('font-bold tracking-tight leading-none truncate min-h-[24px]', 'text-[13px]', isDark ? 'text-zinc-50' : 'text-slate-900')}>
                    {(vehicle.plate || vehicle.engineCode).replace(/-/g, '')}
                  </div>
                  {/* admin — Línea 2: código de motor + fecha mini con segundos (colapsado) */}
                  <div className="flex items-center justify-between mt-0.5 min-h-[14px] gap-2">
                    <span className={cn('text-[11px] font-medium leading-none min-w-0 truncate', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                      {vehicle.engineCode || vehicle.plate.replace(/-/g, '')}
                    </span>
                    {!isExpanded && (
                      <span className={cn('text-[11px] font-medium leading-none shrink-0 whitespace-nowrap text-right', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                        {formatLastSeenMiniSecs(vehicle.lastSeen ?? '')}
                      </span>
                    )}
                  </div>
                </>
              ) : userRole === 'client' ? (
                /* client — placa + engineCode | datetime, igual colapsado y expandido */
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isExpanded && isEditingAlias ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={aliasValue}
                          onChange={(e) => setAliasValue(e.target.value)}
                          onBlur={() => setIsEditingAlias(false)}
                          onKeyDown={(e) => e.key === 'Enter' && setIsEditingAlias(false)}
                          className={cn('text-[13px] font-bold tracking-tight leading-none rounded px-1 py-0.5 outline-none w-full max-w-[120px] border focus:ring-2', isDark ? 'bg-zinc-600 border-blue-400/50 text-zinc-50 focus:ring-blue-400/20' : 'bg-white border-brand/50 text-slate-900 focus:ring-brand/20')}
                        />
                      </div>
                    ) : (
                      <>
                        <span className={cn('font-bold tracking-tight leading-none shrink-0', 'text-[13px]', isDark ? 'text-zinc-50' : 'text-slate-900')}>
                          {vehicle.plate ? vehicle.plate.replace(/-/g, '') : vehicle.engineCode.slice(0, 6)}
                        </span>
                        <span className={cn('text-[10px] font-medium leading-none truncate', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                          {vehicle.engineCode}
                        </span>
                        {isExpanded && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsEditingAlias(true); }}
                            className={cn('transition-colors p-0.5 rounded shrink-0', isDark ? 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-600' : 'text-slate-400 hover:text-brand hover:bg-slate-50')}
                            title="Editar nombre"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <span className={cn('text-[11px] font-medium leading-none whitespace-nowrap', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                    {formatLastSeenWithSecs(vehicle.lastSeen ?? '')}
                  </span>
                </div>
              ) : (
                <>
                  {/* operator — Línea 1: alias editable */}
                  {isEditingAlias ? (
                    <div className="flex items-center gap-1.5 min-h-[24px]" onClick={(e) => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={aliasValue}
                        onChange={(e) => setAliasValue(e.target.value)}
                        onBlur={() => setIsEditingAlias(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingAlias(false)}
                        className="text-[14px] font-bold text-slate-900 tracking-tight leading-none bg-white border border-brand/50 rounded px-1 py-0.5 outline-none focus:ring-2 focus:ring-brand/20 w-full max-w-[150px]"
                      />
                    </div>
                  ) : (
                    <div className={cn('font-bold tracking-tight leading-none flex items-center gap-1.5 truncate min-h-[24px]', 'text-[13px]', isDark ? 'text-zinc-50' : 'text-slate-900')}>
                      <span className="truncate">{aliasValue}</span>
                      {isExpanded && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsEditingAlias(true); }}
                          className={cn('transition-colors p-1 rounded shrink-0', isDark ? 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-600' : 'text-slate-400 hover:text-brand hover:bg-slate-50')}
                          title="Editar alias"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  {/* operator — Línea 2: placa sin guiones + velocidad */}
                  <div className="flex items-center justify-between mt-0.5 min-h-[14px] gap-2">
                    <span className={cn('text-[11px] font-medium leading-none shrink-0', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                      {vehicle.plate.replace(/-/g, '')}
                    </span>
                    {!isExpanded && (
                      <span className={cn('text-[11px] font-bold leading-none shrink-0', brandCls)}>
                        {vehicle.speed}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Botones derecha: chevron + acción */}
          <div className="flex items-center gap-1 shrink-0">
            <div className={cn('flex items-center justify-center transition-all duration-200 w-6 h-6 rounded text-neutral-400', isExpanded && 'rotate-180')}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            {vehicle.gpsDevices?.[0] ? (
              <div className="relative">
                <button
                  ref={esadMenuRef}
                  onClick={(e) => { e.stopPropagation(); setShowEsadMenu(!showEsadMenu); }}
                  className={cn(
                    'flex items-center justify-center rounded transition-colors w-6 h-6',
                    showEsadMenu
                      ? 'text-brand bg-brand/5'
                      : (isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-600' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100')
                  )}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                <GpsAnimatePresence>
                  {showEsadMenu && (
                    <GpsActionMenu
                      triggerRef={esadMenuRef as React.RefObject<HTMLButtonElement>}
                      onClose={() => setShowEsadMenu(false)}
                      vehicle={vehicle}
                      gpsName="Vehículo"
                      gpsDevice={vehicle.gpsDevices![0]}
                      onShowToast={onShowToast}
                      userRole={userRole}
                      onFlyTo={() => onFlyTo(vehicle.position as [number, number])}
                      onTrips={() => setShowTripsModal(true)}
                      onParqueo={() => setShowParqueoModal(true)}
                      onCommand={() => setShowCommandModal(true)}
                      onTogglePin={onTogglePin ? () => onTogglePin(vehicle.id) : undefined}
                      isPinned={isPinned}
                    />
                  )}
                </GpsAnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <button
                  ref={shareButtonRef}
                  onClick={(e) => { e.stopPropagation(); setShowSharePopover(!showSharePopover); }}
                  className={cn(
                    'flex items-center justify-center rounded transition-colors w-6 h-6',
                    showSharePopover
                      ? 'text-brand bg-brand/5'
                      : (isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-600' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100')
                  )}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {showSharePopover && (
                    <SharePopover
                      vehicle={vehicle}
                      triggerRef={shareButtonRef}
                      onClose={() => setShowSharePopover(false)}
                      onOpenHistory={() => setShowShareHistory(true)}
                      onShowToast={onShowToast}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Estado expandido: badge de ignición (no esad) + fecha (no esad) */}
        {isExpanded && userRole !== 'esad' && userRole !== 'client' && (
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex items-center justify-between w-full">
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0',
                vehicle.status === 'active'
                  ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                  : (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600')
              )}>
                <div className={cn('w-1.5 h-1.5 rounded-full', vehicle.status === 'active' ? 'bg-emerald-500' : 'bg-red-500')} />
                {vehicle.status === 'active' ? 'Encendido' : 'Apagado'}
              </div>
              <span className={cn('text-[11px] font-medium whitespace-nowrap', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                {userRole === 'admin'
                  ? formatLastSeenWithSecs(vehicle.lastSeen)
                  : formatLastSeen(vehicle.lastSeen)
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ACORDEÓN EXPANDIDO */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pt-0 pb-3 flex flex-col gap-0">

              {/* ZONA 2 — UBICACIÓN */}
              <div className="flex flex-col gap-2 pt-3 pb-3">
                <div className="flex items-start gap-2">
                  <MapPin className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', brandCls)} />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFlyTo(vehicle.position as [number, number]);
                        if (document.getElementById('map-vehicle-card')) {
                          window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: vehicle.id, source: 'marker' } }));
                        }
                      }}
                      className={cn('text-[11.5px] font-semibold leading-tight text-left transition-colors', isDark ? 'text-zinc-100 hover:text-blue-400' : 'text-slate-800 hover:text-brand')}
                    >{vehicle.address}</button>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyText(`https://www.google.com/maps?q=${vehicle.coords}`, 'card-coords'); }}
                        className={cn('group flex items-center gap-1 text-left text-[10.5px] font-medium tracking-wide transition-colors', isDark ? 'text-zinc-500 hover:text-blue-400' : 'text-slate-400 hover:text-brand')}
                      >
                        {vehicle.coords}
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      </button>
                      {copiedKey === 'card-coords' && (
                        <span className="absolute -top-7 left-0 bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50">Copiado ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ZONA 2.5 — TELEMETRÍA */}
              {userRole !== 'operator' && (() => {
                const alarmVal = vehicle.alarmCount ?? 0;
                const alarmLabel = alarmVal === 0 ? 'Sin ev.' : `${alarmVal} ev.`;
                const stats = userRole === 'admin'
                  ? [
                      { icon: Gauge,     value: vehicle.speed,    label: 'Velocidad',    isAlarm: false, colorClass: null as string | null },
                      { icon: Battery,   value: vehicle.fuel,     label: 'Combustible',  isAlarm: false, colorClass: getBatteryColor(vehicle.fuel) },
                      { icon: Bell,      value: alarmLabel,       label: 'Alertas',      isAlarm: alarmVal > 0, colorClass: null as string | null },
                    ]
                  : userRole === 'esad'
                  ? [
                      { icon: Milestone, value: vehicle.odometer, label: 'Odómetro',     isAlarm: false, colorClass: null as string | null },
                      { icon: Gauge,     value: vehicle.speed,    label: 'Velocidad',    isAlarm: false, colorClass: null as string | null },
                      { icon: Battery,   value: vehicle.fuel,     label: 'Combustible',  isAlarm: false, colorClass: getBatteryColor(vehicle.fuel) },
                      { icon: Bell,      value: alarmLabel,       label: 'Alertas',      isAlarm: alarmVal > 0, colorClass: null as string | null },
                    ]
                  : /* client */ [
                      { icon: Milestone, value: vehicle.odometer, label: 'Odómetro',     isAlarm: false, colorClass: null as string | null },
                      { icon: Gauge,     value: vehicle.speed,    label: 'Velocidad',    isAlarm: false, colorClass: null as string | null },
                      { icon: Battery,   value: vehicle.fuel,     label: 'Combustible',  isAlarm: false, colorClass: getBatteryColor(vehicle.fuel) },
                      { icon: Bell,      value: alarmLabel,       label: 'Alertas',      isAlarm: alarmVal > 0, colorClass: null as string | null },
                    ];
                return (
                  <div className="flex items-center pb-3">
                    {stats.map((stat, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <div className={cn('w-px self-stretch mx-0.5', isDark ? 'bg-zinc-700' : 'bg-slate-100')} />}
                        <div className="flex flex-col items-center gap-1 flex-1 relative group cursor-default">
                          {stat.isAlarm ? (
                            <div className="relative">
                              <Bell className="w-3.5 h-3.5 text-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
                              <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-orange-500 text-white text-[8px] font-bold leading-none">
                                {alarmVal > 99 ? '99+' : alarmVal}
                              </span>
                            </div>
                          ) : (
                            <stat.icon className={cn('w-3.5 h-3.5 opacity-80 group-hover:opacity-100 transition-opacity', stat.colorClass ?? brandCls)} strokeWidth={1.75} />
                          )}
                          <span className={cn('text-[11px] font-semibold tabular-nums',
                            stat.isAlarm ? 'text-orange-500' : stat.colorClass ?? (isDark ? 'text-zinc-200' : 'text-slate-700')
                          )}>
                            {stat.value}
                          </span>
                          <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                            <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">{stat.label}</div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[4px] border-transparent border-t-slate-800" />
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                );
              })()}

              {/* GPS button */}
              {showGpsButton && (
                <div className={cn('relative w-full pt-3 pb-[2px]', isDark ? 'border-t border-zinc-700' : 'border-t border-slate-100')}>
                  <button
                    ref={gpsButtonRef}
                    onClick={(e) => { e.stopPropagation(); setShowGpsPopover(!showGpsPopover); }}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 border rounded-lg transition-colors group',
                      showGpsPopover
                        ? (isDark ? 'bg-blue-400/10 border-blue-400/40' : 'bg-brand/5 border-brand/30')
                        : (isDark ? 'bg-zinc-900/60 border-zinc-700 hover:border-blue-400/40 hover:bg-blue-400/10' : 'bg-slate-50 border-slate-200 hover:border-brand/30 hover:bg-brand/5')
                    )}
                  >
                    <div className={cn('flex items-center gap-1.5 transition-colors', isDark ? 'text-zinc-200 group-hover:text-blue-400' : 'text-slate-700 group-hover:text-brand')}>
                      <LocateFixed className={cn('w-3.5 h-3.5', brandCls)} />
                      <span className="text-[11px] font-semibold">
                        Ver {visibleGpsCount === 1 ? '1 dispositivo' : `${visibleGpsCount} dispositivos`} GPS
                      </span>
                    </div>
                    <div className={cn('flex items-center transition-colors', isDark ? 'text-zinc-400 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-brand')}>
                      {showGpsPopover ? <X className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {showGpsPopover && (
                      <GpsPopover
                        vehicle={vehicle}
                        triggerRef={gpsButtonRef}
                        onClose={() => setShowGpsPopover(false)}
                        userRole={userRole}
                        onShowToast={onShowToast}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ZONA 3 — ACCIONES (oculta para esad — sus acciones están en el menú ⋮) */}
              {userRole !== 'esad' && <div className={cn('flex items-center justify-around pt-2 pb-1', isDark ? 'border-t border-zinc-700' : 'border-t border-slate-100')}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFlyTo(vehicle.position as [number, number]);
                    window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: vehicle.id, source: 'marker' } }));
                  }}
                  className={cn('flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-colors group', isDark ? `text-zinc-400 ${brandHover}` : `text-slate-500 ${brandHover}`)}
                >
                  <MapPin className="w-4 h-4" strokeWidth={1.75} />
                  <span className="text-[10px] font-semibold">Ubicación</span>
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className={cn('flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-colors', isDark ? `text-zinc-400 ${brandHover}` : `text-slate-500 ${brandHover}`)}
                >
                  <Route className="w-4 h-4" strokeWidth={1.75} />
                  <span className="text-[10px] font-semibold">Viajes</span>
                </button>
                {/* Posición 3 */}
                {userRole === 'operator' ? (
                  <button onClick={(e) => e.stopPropagation()} className={cn('flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-colors', isDark ? `text-zinc-400 ${brandHover}` : `text-slate-500 ${brandHover}`)}>
                    <FileText className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Detalle</span>
                  </button>
                ) : (
                  <button onClick={(e) => e.stopPropagation()} className={cn('flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-colors', isDark ? 'text-zinc-400 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-500 hover:text-red-500 hover:bg-red-50')}>
                    <Lock className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Parqueo</span>
                  </button>
                )}
                {/* Posición 4 */}
                {userRole === 'operator' ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('monitorVehicle', { detail: vehicle })); }}
                    className={cn('flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-colors', isDark ? `text-zinc-400 ${brandHover}` : `text-slate-500 ${brandHover}`)}
                  >
                    <MonitorCheck className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Monitoreo</span>
                  </button>
                ) : userRole === 'client' ? (
                  <button onClick={(e) => e.stopPropagation()} className={cn('flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-colors', isDark ? 'text-zinc-400 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-500 hover:text-red-500 hover:bg-red-50')}>
                    <Power className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Bloquear</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('monitorVehicle', { detail: vehicle })); }}
                    className={cn('flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-colors', isDark ? `text-zinc-400 ${brandHover}` : `text-slate-500 ${brandHover}`)}
                  >
                    <MonitorCheck className="w-4 h-4" strokeWidth={1.75} />
                    <span className="text-[10px] font-semibold">Monitoreo</span>
                  </button>
                )}
              </div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal historial de compartidos */}
      <Modal
        isOpen={showShareHistory}
        onClose={() => setShowShareHistory(false)}
        title={`Historial de compartidos - ${vehicle.plate}`}
        icon={Share2}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-gray-600">Gestiona los enlaces de rastreo activos e inactivos generados para esta unidad.</p>
          <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-gray-50 px-5 py-3 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div>Destinatario / Enlace</div>
              <div className="w-24 text-center">Estado</div>
              <div className="w-20 text-center">Acciones</div>
            </div>
            <div className="flex flex-col divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
              {[
                { name: 'Cliente Logística A', time: 'Creado hace 2 horas', status: 'Activo',    url: `https://c-locater.com/track/${vehicle.id}-A` },
                { name: 'Operaciones Centro', time: 'Venció ayer',          status: 'Expirado',  url: `https://c-locater.com/track/${vehicle.id}-B` },
                { name: 'Supervisor Ruta',    time: 'Cancelado hace 2 días', status: 'Cancelado', url: `https://c-locater.com/track/${vehicle.id}-C` },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-bold text-gray-900 truncate">{item.name}</span>
                    <span className="text-[11px] font-medium text-gray-400 mt-0.5">{item.time}</span>
                  </div>
                  <div className="w-24 flex justify-center">
                    <span className={cn('text-[10px] font-bold px-2 py-1 rounded-md',
                      item.status === 'Activo' ? 'bg-[#34C759]/10 text-[#34C759]' :
                      item.status === 'Expirado' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-20 flex justify-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-500 bg-gray-100 hover:bg-brand/10 hover:text-brand rounded-md transition-colors" title="Copiar enlace">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {item.status === 'Activo' && (
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors" title="Cancelar compartido">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal viajes */}
      <Modal
        isOpen={showTripsModal}
        onClose={() => setShowTripsModal(false)}
        title="Historial de viajes"
        icon={Route}
        footer={
          <Button variant="ghost" onClick={() => setShowTripsModal(false)}>Cerrar</Button>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-slate-500">
            Últimos viajes registrados — <strong>{vehicle.plate || vehicle.engineCode.slice(0, 6)} ({vehicle.name})</strong>
          </p>
          <div className="relative">
            <div
              ref={tripsListRef}
              onScroll={checkTripsScroll}
              className="flex flex-col divide-y divide-slate-100 max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {[
                { date: '05/05/2026 08:14', origin: 'Av. Universitaria 3206',    dest: 'Panamericana Norte Km 15', dist: '12.4 km', dur: '28 min' },
                { date: '04/05/2026 17:32', origin: 'Panamericana Norte Km 15',  dest: 'Av. Argentina 1400',       dist: '9.8 km',  dur: '21 min' },
                { date: '04/05/2026 10:05', origin: 'Av. Argentina 1400',         dest: 'Av. Universitaria 3206',  dist: '11.1 km', dur: '33 min' },
                { date: '03/05/2026 14:20', origin: 'Av. Universitaria 3206',    dest: 'Ovalo Miraflores',         dist: '18.7 km', dur: '45 min' },
              ].map((trip, idx) => (
                <div key={idx} className="py-2.5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">{trip.date}</span>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[11.5px] font-semibold text-slate-700 leading-snug truncate">{trip.origin}</span>
                      <span className="text-[11px] text-slate-500 leading-snug truncate">→ {trip.dest}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-[11px] font-semibold text-brand">{trip.dist}</span>
                      <span className="text-[10px] text-slate-400">{trip.dur}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AnimatePresence>
              {showTripsScrollHint && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none"
                >
                  <div className="w-full h-6 bg-gradient-to-t from-white via-white/70 to-transparent" />
                  <div className="w-full flex justify-center pb-1 bg-white">
                    <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                      <ChevronDown className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Modal>

      {/* Modal parqueo */}
      <Modal
        isOpen={showParqueoModal}
        onClose={() => setShowParqueoModal(false)}
        title="Solicitar parqueo"
        icon={Lock}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowParqueoModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => { setShowParqueoModal(false); onShowToast('Solicitud de parqueo enviada'); }}>
              Confirmar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-gray-600">
            Se enviará una solicitud de parqueo a la unidad <strong>{vehicle.plate || vehicle.engineCode.slice(0, 6)} ({vehicle.name})</strong>.
            El vehículo quedará registrado como estacionado en su ubicación actual.
          </p>
          <div className="bg-slate-50 rounded-lg px-3 py-2.5 flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ubicación actual</span>
            <span className="text-[12px] font-medium text-slate-700 leading-snug">{vehicle.address}</span>
            <span className="text-[11px] text-slate-400 font-mono">{vehicle.coords}</span>
          </div>
        </div>
      </Modal>

      {/* Modal comando */}
      <Modal
        isOpen={showCommandModal}
        onClose={() => setShowCommandModal(false)}
        title="Enviar comando"
        icon={Terminal}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCommandModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setShowCommandModal(false)}>Confirmar envío</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-gray-600">
            Estás a punto de enviar un comando operativo a la unidad <strong>{vehicle.plate} ({vehicle.name})</strong>.
            Asegúrate de que es la unidad correcta antes de proceder.
          </p>
        </div>
      </Modal>
    </div>
  );
}
