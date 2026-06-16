import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, MoreVertical, X, Copy, Gauge, Activity, Battery, Bell, Power, LocateFixed } from 'lucide-react';
import { cn, formatLastSeen, formatLastSeenWithSecs } from '../../lib/utils';
import type { UserRole } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import { GpsActionMenu } from './GpsActionMenu';
import { getBatteryColor } from './fleetUtils';
import { useTheme } from '../../lib/ThemeContext';

interface GpsPopoverProps {
  vehicle: Vehicle;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  userRole?: UserRole;
  onShowToast: (msg: string) => void;
}

export function GpsPopover({ vehicle, triggerRef, onClose, userRole = 'operator', onShowToast }: GpsPopoverProps) {
  const { isDark } = useTheme();
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = React.useState<number[]>([]);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<number>>(new Set());

  const toggleGroup = (i: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };
  const [mapMoving, setMapMoving] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = React.useState(false);
  const [openMenuIndex, setOpenMenuIndex] = React.useState<number | null>(null);
  const menuButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const isAdminOrEsad = userRole === 'admin' || userRole === 'esad';

  const getEsadStatus = (status: string) => {
    switch (status) {
      case 'reporting':    return { label: 'Transmitiendo', dot: 'bg-emerald-500', badge: 'text-emerald-500 bg-emerald-500/10', ping: true  };
      case 'no-signal':   return { label: 'Sin señal',      dot: 'bg-amber-500',   badge: 'text-amber-500 bg-amber-500/10',   ping: false };
      case 'low-signal':  return { label: 'Señal baja',     dot: 'bg-orange-500',  badge: 'text-orange-500 bg-orange-500/10', ping: false };
      case 'disconnected': return { label: 'Desconectado',  dot: 'bg-slate-400',   badge: 'text-slate-500 bg-slate-500/10',   ping: false };
      default:            return { label: 'Inactivo',        dot: 'bg-slate-400',   badge: 'text-slate-400 bg-slate-500/10',   ping: false };
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleItem = (i: number) => {
    setExpandedItems(prev => {
      if (prev.includes(i)) {
        window.dispatchEvent(new CustomEvent('gpsDeviceSelected', {
          detail: { vehicleId: vehicle.id, imei: null },
        }));
        return prev.filter(x => x !== i);
      }
      const device = devices[i];
      if (device) {
        window.dispatchEvent(new CustomEvent('gpsDeviceSelected', {
          detail: { vehicleId: vehicle.id, imei: device.imei },
        }));
      }
      return [...prev, i];
    });
  };

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  React.useEffect(() => { setTimeout(checkScroll, 80); }, [expandedItems, pos, checkScroll]);

  // Clear GPS map highlight when popover unmounts
  React.useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('gpsDeviceSelected', {
        detail: { vehicleId: vehicle.id, imei: null },
      }));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calcPos = React.useCallback(() => {
    const popoverWidth = 300;
    const gap = 8;

    const monitor = document.querySelector('[data-floating-monitor]');
    const rect = monitor?.getBoundingClientRect();
    const panelRight = rect?.right ?? 322;
    const panelLeft  = rect?.left  ?? 16;
    const panelTop   = rect?.top   ?? 16;

    let left = panelRight + gap;
    if (left + popoverWidth > window.innerWidth - 20) {
      left = Math.max(20, panelLeft - gap - popoverWidth);
    }
    let top = panelTop;
    const popoverHeight = 420;
    if (top + popoverHeight > window.innerHeight - 20) {
      top = Math.max(panelTop, window.innerHeight - popoverHeight - 20);
    }
    setPos({ top, left });
  }, []);

  React.useEffect(() => { calcPos(); }, [calcPos]);

  React.useEffect(() => {
    const handler = () => { setTimeout(calcPos, 250); };
    window.addEventListener('collapseSidebar', handler);
    return () => window.removeEventListener('collapseSidebar', handler);
  }, [calcPos]);

  React.useEffect(() => {
    const onStart = () => setMapMoving(true);
    const onEnd   = () => setMapMoving(false);
    window.addEventListener('mapMoveStart', onStart);
    window.addEventListener('mapMoveEnd',   onEnd);
    return () => {
      window.removeEventListener('mapMoveStart', onStart);
      window.removeEventListener('mapMoveEnd',   onEnd);
    };
  }, []);

  if (!pos) return null;

  const devices = vehicle.gpsDevices ?? [];

  return createPortal(
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: mapMoving ? 0 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: mapMoving ? 0.15 : 0.2 }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        'fixed z-[9999] border flex flex-col gap-3 overflow-hidden',
        'rounded-md p-3 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-2xl',
        isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-neutral-200/80'
      )}
      style={{ top: pos.top, left: pos.left, maxHeight: `calc(100vh - ${pos.top}px - 20px)`, width: 300, pointerEvents: mapMoving ? 'none' : undefined }}
    >
      <div className={cn('flex items-center justify-between shrink-0 px-1')}>
        <span className={cn('text-[13px] font-bold', isDark ? 'text-zinc-100' : 'text-neutral-800')}>Dispositivos GPS</span>
        <button
          onClick={onClose}
          className={cn(
            'w-6 h-6 flex items-center justify-center rounded-md transition-colors',
            isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
          )}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={() => { checkScroll(); setOpenMenuIndex(null); }}
        className="flex flex-col gap-2 overflow-y-auto min-h-0 flex-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {devices.map((gpsDevice, i) => {
          const isMain      = i === 0;
          const isExpanded  = expandedItems.includes(i);
          const isReporting = gpsDevice.reportStatus === 'reporting';
          const typeLabel   = gpsDevice.type === 'flotas' ? 'SVR Plus' : gpsDevice.type === 'basico' ? 'SVR Básico' : gpsDevice.type === 'contingencia' ? 'SVR Contingencia' : 'SVR X';
          // Color del nombre del plan — blue-400 en dark (contraste ok sobre zinc-900)
          const typeLabelColor = isMain
            ? (isDark ? 'text-blue-400' : 'text-brand')
            : (isDark ? 'text-zinc-100' : 'text-slate-800');
          const suffixColor = isMain
            ? (isDark ? 'text-blue-400/70' : 'text-brand/70')
            : (isDark ? 'text-zinc-500'    : 'text-slate-400');
          const signalIconColor = gpsDevice.reportStatus === 'reporting' ? 'text-emerald-500'
            : gpsDevice.reportStatus === 'low-signal'  ? 'text-orange-500'
            : gpsDevice.reportStatus === 'disconnected' ? 'text-red-500'
            : isDark ? 'text-zinc-500' : 'text-slate-400';
          const esadStatus = userRole === 'esad' ? getEsadStatus(gpsDevice.reportStatus) : null;
          const labelCls   = isDark ? 'text-zinc-500' : 'text-slate-400';
          const valueCls   = isDark ? 'text-zinc-300' : 'text-slate-600';
          const dividerCls = isDark ? 'border-zinc-700' : 'border-slate-200';

          return (
            <div
              key={i}
              className={cn(
                'relative border transition-all rounded-md',
                isExpanded
                  ? isMain
                    ? (isDark ? 'border-blue-400/20 bg-zinc-800/60' : 'border-blue-200 bg-white')
                    : (isDark ? 'border-zinc-700 bg-zinc-800/60' : 'border-neutral-200 bg-white')
                  : (isDark ? 'border-transparent hover:border-zinc-700 hover:bg-zinc-800/40' : 'border-transparent hover:border-neutral-200')
              )}
            >
              {/* Header row — pr-20 deja espacio para los botones absolutos */}
              <button className="w-full p-3 pr-20 flex items-start text-left" onClick={() => toggleItem(i)}>
                <div className="flex items-start w-full">
                  <div className="flex flex-col gap-[6px] flex-1 min-w-0">

                    {/* Fila 1: Nombre del plan + jerarquía como sufijo de color */}
                    <div className="flex items-baseline gap-2">
                      <span className={cn('text-[13px] font-bold leading-none', typeLabelColor)}>{typeLabel}</span>
                      <span className={cn('text-[10px] font-semibold leading-none shrink-0', suffixColor)}>
                        {isMain ? 'Principal' : 'Secundario'}
                      </span>
                    </div>

                    {/* Fila 2: Fecha y hora del último reporte */}
                    {isAdminOrEsad && (
                      <span className={cn('text-[10px] font-medium leading-none', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                        {formatLastSeenWithSecs(gpsDevice.lastSeen)}
                      </span>
                    )}
                    {!isAdminOrEsad && userRole === 'operator' && (
                      <span className={cn('text-[10px] font-medium leading-none', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                        {formatLastSeen(gpsDevice.lastSeen)}
                      </span>
                    )}

                    {/* Fila 3: Señal (LocateFixed + label) + Ignición (esad) */}
                    <div className="flex items-center gap-1.5">
                      {userRole === 'esad' ? (
                        esadStatus && (
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 shrink-0', esadStatus.badge)}>
                            <span className="relative flex items-center justify-center w-3.5 h-3.5">
                              {esadStatus.ping && <span className={cn('absolute inset-0 rounded-full animate-ping opacity-50', esadStatus.dot)} />}
                              <LocateFixed className="w-3.5 h-3.5 relative" />
                            </span>
                            {esadStatus.label}
                          </span>
                        )
                      ) : (
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 shrink-0',
                          isReporting
                            ? 'text-emerald-500 bg-emerald-500/10'
                            : isDark ? 'text-zinc-500 bg-zinc-800' : 'text-slate-400 bg-slate-100'
                        )}>
                          <span className="relative flex items-center justify-center w-3.5 h-3.5">
                            {isReporting && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />}
                            <LocateFixed className="w-3.5 h-3.5 relative" />
                          </span>
                          {isReporting ? 'Reportando' : 'Inactivo'}
                        </span>
                      )}
                      {userRole === 'esad' && (
                        <span
                          className={cn(
                            'relative group text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 cursor-default',
                            gpsDevice.ignition === 'on'
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : isDark ? 'text-zinc-500 bg-zinc-800' : 'text-slate-400 bg-slate-100'
                          )}
                        >
                          <Power className="w-2.5 h-2.5" />
                          {gpsDevice.ignition === 'on' ? 'ON' : 'OFF'}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                            <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">Ignición</div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[4px] border-transparent border-t-slate-800" />
                          </div>
                        </span>
                      )}
                    </div>

                    {/* IMEI + Línea */}
                    <div className="flex gap-3 mt-[2px]">
                      <div className="flex flex-col gap-0.5">
                        <span className={cn('text-[9px] font-semibold uppercase tracking-wider leading-none', labelCls)}>IMEI</span>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyText(gpsDevice.imei, `imei-${i}`); }}
                            className={cn('group flex items-center gap-1 text-left text-[11px] font-mono font-medium leading-snug hover:text-brand hover:underline transition-colors', valueCls)}
                          >
                            {gpsDevice.imei}
                            <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                          </button>
                          {copiedKey === `imei-${i}` && (
                            <span className="absolute -top-7 left-0 bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-10">Copiado ✓</span>
                          )}
                        </div>
                      </div>
                      {userRole === 'esad' && (
                        <div className={cn('flex flex-col gap-0.5 border-l pl-3', dividerCls)}>
                          <span className={cn('text-[9px] font-semibold uppercase tracking-wider leading-none', labelCls)}>LÍNEA</span>
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); copyText(gpsDevice.linea, `linea-${i}`); }}
                              className={cn('group flex items-center gap-1 text-left text-[11px] font-mono font-medium leading-snug hover:text-brand hover:underline transition-colors whitespace-nowrap', valueCls)}
                            >
                              {gpsDevice.linea}
                              <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                            </button>
                            {copiedKey === `linea-${i}` && (
                              <span className="absolute -top-7 left-0 bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-10">Copiado ✓</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Botones fijos — absolute top-3 right-3, nunca se mueven */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={() => toggleItem(i)}
                  className={cn(
                    'flex items-center justify-center border transition-all w-6 h-6 rounded-md',
                    isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50',
                    isExpanded && 'rotate-180'
                  )}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="relative">
                  <button
                    ref={el => { menuButtonRefs.current[i] = el; }}
                    className={cn(
                      'flex items-center justify-center border transition-colors w-6 h-6 rounded-md',
                      openMenuIndex === i
                        ? 'border-brand/30 text-brand bg-brand/5'
                        : (isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50')
                    )}
                    onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === i ? null : i); }}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {openMenuIndex === i && menuButtonRefs.current[i] && (
                      <GpsActionMenu
                        triggerRef={{ current: menuButtonRefs.current[i] } as React.RefObject<HTMLButtonElement>}
                        onClose={() => setOpenMenuIndex(null)}
                        vehicle={vehicle}
                        gpsName={typeLabel}
                        gpsDevice={gpsDevice}
                        onShowToast={onShowToast}
                        userRole={userRole}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Expandable content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={cn('px-3 pb-3 flex flex-col gap-2 pt-2 border-t', isDark ? 'border-zinc-700' : 'border-neutral-100')}>
                      <div className="flex flex-col gap-1">
                        <span className={cn('text-[11.5px] font-semibold leading-tight', isDark ? 'text-zinc-200' : 'text-slate-800')}>{vehicle.address}</span>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyText(`https://www.google.com/maps?q=${vehicle.coords}`, `coords-${i}`); }}
                            className={cn('group flex items-center gap-1 text-left text-[10.5px] font-medium tracking-wide hover:text-brand transition-colors', labelCls)}
                          >
                            {vehicle.coords}
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                          </button>
                          {copiedKey === `coords-${i}` && (
                            <span className="absolute -top-7 left-0 bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-10">Copiado ✓</span>
                          )}
                        </div>
                      </div>

                      {/* Métricas */}

                      <div className="flex items-center">
                        {(userRole === 'esad'
                          ? [
                              { icon: Activity, value: vehicle.odometer,             label: 'Odómetro',  isAlarm: false, colorClass: null as string | null, colClass: 'flex-1' },
                              { icon: Gauge,    value: gpsDevice.speed,              label: 'Velocidad', isAlarm: false, colorClass: null as string | null, colClass: 'flex-1' },
                              { icon: Battery,  value: gpsDevice.fuel,               label: 'Batería',   isAlarm: false, colorClass: getBatteryColor(gpsDevice.fuel), colClass: 'flex-1' },
                              { icon: Bell,     value: String(gpsDevice.alarmCount), label: 'Eventos',   isAlarm: true,  colorClass: null as string | null, colClass: 'flex-1' },
                            ]
                          : [
                              { icon: Gauge,   value: gpsDevice.speed,              label: 'Velocidad', isAlarm: false, colorClass: null as string | null, colClass: 'flex-1' },
                              { icon: Battery, value: gpsDevice.fuel,               label: 'Batería',   isAlarm: false, colorClass: getBatteryColor(gpsDevice.fuel), colClass: 'flex-1' },
                              { icon: Bell,    value: String(gpsDevice.alarmCount), label: 'Eventos',   isAlarm: true,  colorClass: null as string | null, colClass: 'flex-1' },
                            ]
                        ).map((stat, idx) => (
                          <React.Fragment key={idx}>
                            <div className={cn('flex flex-col items-center gap-1 relative group cursor-default', stat.colClass)}>
                              {stat.isAlarm ? (
                                <div className="relative">
                                  <stat.icon className="w-3.5 h-3.5 text-orange-500" strokeWidth={1.75} />
                                  {Number(stat.value) > 0 && (
                                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full bg-orange-500 text-white text-[8px] font-bold leading-none">
                                      {Number(stat.value) > 99 ? '99+' : stat.value}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <stat.icon className={cn('w-3.5 h-3.5', stat.colorClass ?? (isDark ? 'text-blue-400' : 'text-brand'))} strokeWidth={1.75} />
                              )}
                              <span className={cn('text-[11px] font-semibold tabular-nums',
                                stat.isAlarm && Number(stat.value) > 0 ? 'text-orange-500' : stat.colorClass ?? (isDark ? 'text-zinc-300' : 'text-slate-700')
                              )}>
                                {stat.isAlarm
                                  ? Number(stat.value) === 0 ? 'Sin eventos' : `${stat.value} eventos`
                                  : stat.value
                                }
                              </span>
                              <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                                <div className="bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">{stat.label}</div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[4px] border-transparent border-t-slate-800" />
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Grupo / Subgrupo — solo esad, debajo de métricas */}

                      {userRole === 'esad' && gpsDevice.groups && gpsDevice.groups.length > 0 && (
                        <div className={cn('pt-2 border-t', isDark ? 'border-zinc-700' : 'border-slate-100')}>
                          <div className="flex flex-col gap-1.5">
                            {/* Encabezado: etiquetas de columna + flecha si hay múltiples */}
                            <button
                              disabled={gpsDevice.groups.length === 1}
                              onClick={(e) => { e.stopPropagation(); toggleGroup(i); }}
                              className="flex items-center gap-1 w-full text-left"
                            >
                              <span className={cn('text-[9px] font-semibold uppercase tracking-wider leading-none flex-1', labelCls)}>
                                {gpsDevice.groups.length === 1 ? 'Grupo' : `Grupos (${gpsDevice.groups.length})`}
                              </span>
                              {gpsDevice.groups[0].subgroup && (
                                <span className={cn('text-[9px] font-semibold uppercase tracking-wider leading-none flex-1', labelCls)}>Subgrupo</span>
                              )}
                              {gpsDevice.groups.length > 1 && (
                                <ChevronRight className={cn('w-3 h-3 transition-transform duration-200 shrink-0', labelCls, expandedGroups.has(i) && 'rotate-90')} />
                              )}
                            </button>

                            {/* Fila del primer grupo — siempre visible */}
                            {(() => {
                              const g = gpsDevice.groups[0];
                              return (
                                <div className="flex gap-3">
                                  <span className={cn('text-[11px] font-medium leading-snug flex-1', valueCls)}>{g.name}</span>
                                  {g.subgroup && (
                                    <span className={cn('text-[11px] font-medium leading-snug flex-1', valueCls)}>{g.subgroup}</span>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Grupos adicionales — colapsables */}
                            <AnimatePresence initial={false}>
                              {expandedGroups.has(i) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.18 }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex flex-col gap-1.5">
                                    {gpsDevice.groups.slice(1).map((g, gi) => (
                                      <div key={gi} className="flex gap-3">
                                        <span className={cn('text-[11px] font-medium leading-snug flex-1', valueCls)}>{g.name}</span>
                                        <span className={cn('text-[11px] font-medium leading-snug flex-1', valueCls)}>
                                          {g.subgroup ?? <span className={isDark ? 'text-zinc-600' : 'text-slate-300'}>—</span>}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Scroll hint */}
      <AnimatePresence>
        {showScrollHint && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none rounded-b-xl overflow-hidden"
          >
            <div className={cn('w-full h-5 bg-gradient-to-t to-transparent', isDark ? 'from-zinc-900 via-zinc-900/60' : 'from-white via-white/60')} />
            <div className={cn('w-full flex justify-center pb-2', isDark ? 'bg-zinc-900' : 'bg-white')}>
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                <ChevronDown className={cn('w-5 h-5', isDark ? 'text-zinc-400' : 'text-slate-700')} strokeWidth={2.5} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}
