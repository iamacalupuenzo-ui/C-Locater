import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MoreVertical, X, Copy, Gauge, Compass, Activity, Battery, Bell, Power } from 'lucide-react';
import { cn, formatLastSeen, formatLastSeenWithSecs } from '../../lib/utils';
import type { UserRole } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import { GpsActionMenu } from './GpsActionMenu';
import { getBatteryColor } from './fleetUtils';

interface GpsPopoverProps {
  vehicle: Vehicle;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  userRole?: UserRole;
  profile?: 'c-go' | 'c-loc';
  onShowToast: (msg: string) => void;
}

export function GpsPopover({ vehicle, triggerRef, onClose, userRole = 'operator', profile = 'c-go', onShowToast }: GpsPopoverProps) {
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = React.useState<number[]>([]);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = React.useState(false);
  const [openMenuIndex, setOpenMenuIndex] = React.useState<number | null>(null);
  const menuButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const isAdminOrEsad = userRole === 'admin' || userRole === 'esad';

  const getEsadStatus = (status: string) => {
    switch (status) {
      case 'reporting':    return { label: 'Transmitiendo', dot: 'bg-emerald-500', badge: 'text-emerald-600 bg-emerald-50', ping: true  };
      case 'no-signal':   return { label: 'Sin señal',      dot: 'bg-amber-500',   badge: 'text-amber-600 bg-amber-50',    ping: false };
      case 'low-signal':  return { label: 'Señal baja',     dot: 'bg-orange-500',  badge: 'text-orange-600 bg-orange-50',  ping: false };
      case 'disconnected': return { label: 'Desconectado',  dot: 'bg-slate-400',   badge: 'text-slate-500 bg-slate-100',   ping: false };
      default:            return { label: 'Inactivo',        dot: 'bg-slate-400',   badge: 'text-slate-400 bg-slate-100',   ping: false };
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleItem = (i: number) => {
    setExpandedItems(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  React.useEffect(() => { setTimeout(checkScroll, 80); }, [expandedItems, pos, checkScroll]);

  React.useEffect(() => {
    const popoverWidth = 320;
    const gap = 16;
    const panel = document.querySelector('[data-vehicle-panel]');
    const panelRect = panel?.getBoundingClientRect();
    const panelRight = panelRect?.right ?? 380;
    const panelTop   = panelRect?.top   ?? 84;
    const statsRow   = document.querySelector('[data-stats-row]');
    const top0 = statsRow ? statsRow.getBoundingClientRect().bottom + gap : panelTop;
    let left = panelRight + gap;
    let top  = top0;
    if (left + popoverWidth > window.innerWidth - 20) {
      left = Math.max(panelRight + gap, window.innerWidth - popoverWidth - 20);
    }
    const popoverHeight = 420;
    if (top + popoverHeight > window.innerHeight - 20) {
      top = Math.max(top0, window.innerHeight - popoverHeight - 20);
    }
    setPos({ top, left });
  }, [triggerRef]);

  React.useEffect(() => {
    if (!pos) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!containerRef.current?.contains(target) && !triggerRef.current?.contains(target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pos, onClose, triggerRef]);

  if (!pos) return null;

  const devices = vehicle.gpsDevices
    ? (profile === 'c-go' && userRole === 'operator'
        ? vehicle.gpsDevices.filter(d => d.type !== 'contingencia')
        : vehicle.gpsDevices)
    : [];

  return createPortal(
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{ top: pos.top, left: pos.left, maxHeight: `calc(100vh - ${pos.top}px - 20px)` }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[9999] w-[320px] bg-white border border-slate-200/80 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 flex flex-col gap-3 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-1 shrink-0">
        <span className="text-[13px] font-bold text-slate-800">Dispositivos GPS</span>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4" />
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
          const typeLabelColor = isMain ? 'text-brand' : gpsDevice.type === 'contingencia' ? 'text-violet-500' : 'text-slate-800';

          return (
            <div
              key={i}
              className={cn(
                'relative rounded-xl border transition-all',
                isExpanded
                  ? isMain ? 'border-brand/20 bg-white shadow-sm' : 'border-slate-200 bg-white shadow-sm'
                  : 'border-transparent bg-white hover:border-slate-200 hover:shadow-sm'
              )}
            >
              {/* Header row — pr-20 deja espacio para los botones absolutos */}
              <button className="w-full p-3 pr-20 flex items-start text-left" onClick={() => toggleItem(i)}>
                <div className="flex items-start w-full">
                  <div className="flex flex-col gap-[6px] flex-1 min-w-0">

                    {/* Fila 1: Título + Estado de señal al lado */}
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[13px] font-bold leading-none', typeLabelColor)}>{typeLabel}</span>
                      {userRole === 'esad' ? (() => {
                        const s = getEsadStatus(gpsDevice.reportStatus);
                        return (
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0', s.badge)}>
                            <span className="relative flex w-1.5 h-1.5">
                              <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                              {s.ping && <span className={cn('absolute inset-0 rounded-full animate-ping opacity-75', s.dot)} />}
                            </span>
                            {s.label}
                          </span>
                        );
                      })() : (
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0', isReporting ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100')}>
                          <span className="relative flex w-1.5 h-1.5">
                            <span className={cn('w-1.5 h-1.5 rounded-full', isReporting ? 'bg-emerald-500' : 'bg-slate-400')} />
                            {isReporting && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
                          </span>
                          {isReporting ? 'Reportando' : 'Inactivo'}
                        </span>
                      )}
                    </div>

                    {/* Fila 2: Fecha y hora del último reporte */}
                    {isAdminOrEsad && (
                      <span className="text-[10px] font-medium text-slate-400 leading-none">
                        {formatLastSeenWithSecs(gpsDevice.lastSeen)}
                      </span>
                    )}
                    {!isAdminOrEsad && userRole === 'operator' && (
                      <span className="text-[10px] font-medium text-slate-400 leading-none">
                        {formatLastSeen(gpsDevice.lastSeen)}
                      </span>
                    )}

                    {/* Fila 3: Jerarquía + Ignición */}
                    <div className="flex items-center gap-1.5">
                      {isMain
                        ? <span className="text-[10px] font-bold text-white bg-brand px-2 py-0.5 rounded-full">Principal</span>
                        : gpsDevice.type === 'contingencia'
                          ? <span className="text-[10px] font-medium text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full bg-slate-50">Respaldo</span>
                          : <span className="text-[10px] font-medium text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full bg-slate-50">Secundario</span>
                      }
                      {userRole === 'esad' && (
                        <span
                          className={cn(
                            'relative group text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 cursor-default',
                            gpsDevice.ignition === 'on' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'
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
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">IMEI</span>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyText(gpsDevice.imei, `imei-${i}`); }}
                            className="group flex items-center gap-1 text-left text-[11px] font-mono font-medium text-slate-600 leading-snug hover:text-brand hover:underline transition-colors"
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
                        <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-3">
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">LÍNEA</span>
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); copyText(gpsDevice.linea, `linea-${i}`); }}
                              className="group flex items-center gap-1 text-left text-[11px] font-mono font-medium text-slate-600 leading-snug hover:text-brand hover:underline transition-colors whitespace-nowrap"
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
                  className={cn('w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all', isExpanded && 'rotate-180')}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    ref={el => { menuButtonRefs.current[i] = el; }}
                    className={cn('w-7 h-7 flex items-center justify-center rounded-lg border bg-white transition-colors',
                      openMenuIndex === i ? 'border-brand/30 text-brand bg-brand/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
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
                        profile={profile}
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
                    <div className="px-3 pb-3 flex flex-col gap-2 border-t border-slate-100 pt-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11.5px] font-semibold text-slate-800 leading-tight">{vehicle.address}</span>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyText(`https://www.google.com/maps?q=${vehicle.coords}`, `coords-${i}`); }}
                            className="group flex items-center gap-1 text-left text-[10.5px] font-medium text-slate-400 tracking-wide hover:text-brand transition-colors"
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
                          : profile === 'c-go' && userRole === 'operator'
                          ? [
                              { icon: Gauge,    value: gpsDevice.speed,   label: 'Velocidad', isAlarm: false, colorClass: null as string | null, colClass: 'flex-1' },
                              { icon: Compass,  value: vehicle.direction, label: 'Dirección', isAlarm: false, colorClass: null as string | null, colClass: 'flex-1' },
                              { icon: Activity, value: vehicle.odometer,  label: 'Odómetro',  isAlarm: false, colorClass: null as string | null, colClass: 'flex-1' },
                              { icon: Battery,  value: gpsDevice.fuel,    label: 'Batería',   isAlarm: false, colorClass: getBatteryColor(gpsDevice.fuel), colClass: 'flex-1' },
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
                                <stat.icon className={cn('w-3.5 h-3.5', stat.colorClass ?? 'text-brand')} strokeWidth={1.75} />
                              )}
                              <span className={cn('text-[11px] font-semibold tabular-nums',
                                stat.isAlarm && Number(stat.value) > 0 ? 'text-orange-500' : stat.colorClass ?? 'text-slate-700'
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

                      {userRole === 'esad' && gpsDevice.group && (
                        <div className="flex gap-3 pt-2 border-t border-slate-100">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Grupo</span>
                            <span className="text-[11px] font-medium text-slate-600 leading-snug">{gpsDevice.group}</span>
                          </div>
                          {gpsDevice.subgroup && (
                            <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-3">
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Subgrupo</span>
                              <span className="text-[11px] font-medium text-slate-600 leading-snug">{gpsDevice.subgroup}</span>
                            </div>
                          )}
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
            <div className="w-full h-5 bg-gradient-to-t from-white via-white/60 to-transparent" />
            <div className="w-full bg-white flex justify-center pb-2">
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                <ChevronDown className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}
