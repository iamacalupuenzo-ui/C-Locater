import { useState, useEffect, useRef, useCallback, useMemo, type ElementType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gauge, ChevronsDown, Zap, Navigation2, Clock, MapPin, X, Share2, Download, ChevronDown, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import { VehicleTrackingMap } from './VehicleTrackingMap';
import { TripPanel, generateTrips } from './TripPanel';
import type { TripEventType, TripEventGroup } from './TripPanel';
import { TripDownloadModal } from './TripDownloadModal';
import { Checkbox } from '../ui/Checkbox';

// ─── Config visual de tipos de evento ─────────────────────────────────────
const EVENT_CONFIG: Record<TripEventType, {
  label: string; shortLabel: string;
  color: string;
  Icon: ElementType;
}> = {
  speeding:           { label: 'Exceso de velocidad', shortLabel: 'Velocidad',   color: '#ef4444', Icon: Gauge        },
  hard_braking:       { label: 'Frenado brusco',      shortLabel: 'Frenado',     color: '#f59e0b', Icon: ChevronsDown },
  harsh_acceleration: { label: 'Aceleración brusca',  shortLabel: 'Aceleración', color: '#f97316', Icon: Zap          },
  sharp_turn:         { label: 'Giro brusco',         shortLabel: 'Giro',        color: '#a855f7', Icon: Navigation2  },
};

interface TripEventsPayload { tripId: string; groups: TripEventGroup[] }

interface VehicleTripViewProps {
  vehicle: Vehicle;
  onBack: () => void;
  isDark?: boolean;
}

export function VehicleTripView({ vehicle, isDark = false }: VehicleTripViewProps) {
  const [tripEvents, setTripEvents]         = useState<TripEventsPayload | null>(null);
  const [activeEventTypes, setActiveEventTypes] = useState<Set<TripEventType>>(new Set());
  const [eventFilterOpen, setEventFilterOpen] = useState(false);
  const [selectedEventId, setSelectedEvent] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLDivElement>(null);

  // Todas las rutas del vehículo para mostrar como fantasmas en el mapa
  const allVehicleTrips = useMemo(() => generateTrips(vehicle), [vehicle]);
  const backgroundRoutes = useMemo(() =>
    allVehicleTrips
      .filter(t => t.id !== selectedTripId && t.routeCoords != null)
      .map(t => t.routeCoords!),
    [allVehicleTrips, selectedTripId]
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const payload = (e as CustomEvent<TripEventsPayload | null>).detail;
      setTripEvents(payload);
      setActiveEventTypes(new Set());
      setEventFilterOpen(false);
      setSelectedEvent(null);
      setShowScrollHint(false);
    };
    window.addEventListener('tripEventsSelected', handler);
    return () => window.removeEventListener('tripEventsSelected', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tripId: string } | null>).detail;
      setSelectedTripId(detail?.tripId ?? null);
    };
    window.addEventListener('tripRouteSelected', handler);
    return () => window.removeEventListener('tripRouteSelected', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { type, id, coords } = (e as CustomEvent<{ type: TripEventType; id: string; coords: [number, number] }>).detail;
      setSelectedEvent(id);
      setActiveEventTypes(new Set([type]));
      window.dispatchEvent(new CustomEvent('highlightEvent', { detail: { id, coords } }));
    };
    window.addEventListener('selectEventFromMap', handler);
    return () => window.removeEventListener('selectEventFromMap', handler);
  }, []);

  const checkScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setShowScrollHint(el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const t = setTimeout(checkScroll, 80);
    el.addEventListener('scroll', checkScroll);
    return () => { clearTimeout(t); el.removeEventListener('scroll', checkScroll); };
  }, [checkScroll, activeEventTypes, tripEvents]);

  // Cerrar dropdown de filtro al hacer clic fuera
  useEffect(() => {
    if (!eventFilterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterBtnRef.current && !filterBtnRef.current.contains(e.target as Node)) {
        setEventFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [eventFilterOpen]);

  const filteredInstances = useMemo(() => {
    if (!tripEvents) return [];
    const groups = activeEventTypes.size === 0
      ? tripEvents.groups
      : tripEvents.groups.filter(g => activeEventTypes.has(g.type));
    return groups
      .flatMap(g => g.instances.map(inst => ({ ...inst, groupType: g.type as TripEventType })))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [tripEvents, activeEventTypes]);

  function toggleEventType(type: TripEventType) {
    setActiveEventTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
    setSelectedEvent(null);
    window.dispatchEvent(new CustomEvent('clearEventHighlight'));
  }

  // ─── Botones de mapa ───────────────────────────────────────────────────
  const [shareOk,          setShareOk]          = useState(false);
  const [dlOk,             setDlOk]             = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    try {
      const text = `${vehicle.name} · ${vehicle.plate}`;
      if (navigator.share) {
        await navigator.share({ title: text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setShareOk(true);
      setTimeout(() => setShareOk(false), 2000);
    } catch { /* cancelado por el usuario */ }
  }, [vehicle.name, vehicle.plate]);

  const selectedTrip = useMemo(
    () => selectedTripId ? allVehicleTrips.find(t => t.id === selectedTripId) ?? null : null,
    [selectedTripId, allVehicleTrips],
  );

  const handleDownload = useCallback(() => {
    setShowDownloadModal(true);
  }, []);

  return (
    <div className={cn('flex w-full h-full overflow-hidden', isDark ? 'bg-zinc-950' : 'bg-neutral-100')}>

      {/* ── Panel izquierdo: historial de viajes ── */}
      <div className="w-[322px] flex-none flex flex-col overflow-hidden p-3 pr-0">
        <TripPanel vehicle={vehicle} isDark={isDark} />
      </div>

      <AnimatePresence>
        {tripEvents && (
          <motion.div
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -12, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-[290px] flex-none flex flex-col h-full p-3 pl-3 pr-0"
          >
            <div className={cn(
              'flex-1 rounded-md border flex flex-col min-h-0',
              isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
            )}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 shrink-0">
                <span className={cn('text-[9.5px] font-semibold uppercase tracking-wider', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                  Eventos del viaje
                </span>
                <button
                  onClick={() => setTripEvents(null)}
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center transition-colors',
                    isDark ? 'hover:bg-zinc-700/70 text-zinc-500' : 'hover:bg-neutral-100 text-slate-400',
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Filtros — mismo estándar que la pestaña Viajes (Hoy/Todos/Fecha) */}
              <div className="relative z-[60] px-1.5 py-2.5 shrink-0 flex items-center gap-1">
                {/* Todos */}
                <button
                  onClick={() => { setActiveEventTypes(new Set()); setEventFilterOpen(false); setSelectedEvent(null); window.dispatchEvent(new CustomEvent('clearEventHighlight')); }}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors',
                    activeEventTypes.size === 0
                      ? (isDark ? 'text-zinc-100 bg-zinc-800' : 'text-neutral-900 bg-neutral-100')
                      : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70'),
                  )}
                >
                  <span>Todos</span>
                </button>

                {/* Filtrar — dropdown multi-selección */}
                <div className="relative" ref={filterBtnRef}>
                  <button
                    onClick={() => setEventFilterOpen(p => !p)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] transition-colors',
                      activeEventTypes.size > 0
                        ? cn('font-bold', isDark ? 'text-zinc-100 bg-zinc-800' : 'text-neutral-900 bg-neutral-100')
                        : cn('font-medium', isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70'),
                    )}
                  >
                    <Filter className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span>{activeEventTypes.size > 0 ? `${String(activeEventTypes.size).padStart(2, '0')} Filtrar` : 'Filtrar'}</span>
                    <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform', eventFilterOpen && 'rotate-180')} strokeWidth={2.5} />
                  </button>

                  <AnimatePresence>
                    {eventFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className={cn(
                          'absolute top-full left-0 mt-1 z-20 rounded-lg border shadow-[0_4px_20px_rgba(0,0,0,0.18)] p-1.5 min-w-[240px]',
                          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200',
                        )}
                      >
                        <div className={cn('px-2 py-1.5 text-[11px] font-medium', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                          Tipo de evento
                        </div>

                        {tripEvents.groups.map(group => {
                          const cfg      = EVENT_CONFIG[group.type];
                          const isChecked = activeEventTypes.has(group.type);
                          return (
                            <div
                              key={group.type}
                              onClick={() => toggleEventType(group.type)}
                              className={cn(
                                'flex items-center gap-2 w-full px-3 py-2 rounded-md text-left transition-colors cursor-pointer',
                                isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-700 hover:bg-slate-100',
                              )}
                            >
                              <Checkbox size="sm" checked={isChecked} />
                              <cfg.Icon size={14} strokeWidth={1.75} style={{ color: cfg.color }} className="shrink-0" />
                              <span className="text-xs flex-1 whitespace-nowrap">{cfg.label}</span>
                              <span className={cn('text-[11px] font-medium tabular-nums', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                                {group.instances.length}
                              </span>
                            </div>
                          );
                        })}

                        {activeEventTypes.size > 0 && (
                          <>
                            <div className={cn('h-px my-1', isDark ? 'bg-zinc-700' : 'bg-slate-200')} />
                            <button
                              onClick={() => { setActiveEventTypes(new Set()); setSelectedEvent(null); window.dispatchEvent(new CustomEvent('clearEventHighlight')); }}
                              className={cn(
                                'w-full text-center px-3 py-2 rounded-md text-xs font-medium transition-colors',
                                isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-slate-500 hover:bg-slate-100',
                              )}
                            >
                              Limpiar filtros
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Lista de instancias del tipo activo */}
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <div
                  ref={listRef}
                  className="h-full overflow-y-auto px-3 py-2 [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={Array.from(activeEventTypes).sort().join(',') || 'all'}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex flex-col gap-1.5 pb-6"
                    >
                      {filteredInstances.map(ev => {
                        const cfg = EVENT_CONFIG[ev.groupType];
                        const isSelected = selectedEventId === ev.id;
                        const sec = ev.time.length <= 5 ? String((parseInt(ev.id.slice(-1), 10) || 0) * 7 % 60).padStart(2, '0') : '';
                        const displayTime = ev.time.length <= 5 ? ev.time + ':' + sec : ev.time;
                        return (
                          <button
                            key={ev.id}
                            onClick={() => {
                              if (selectedEventId === ev.id) {
                                setSelectedEvent(null);
                                window.dispatchEvent(new CustomEvent('clearEventHighlight'));
                                window.dispatchEvent(new CustomEvent('refitRouteBounds'));
                              } else {
                                setSelectedEvent(ev.id);
                                window.dispatchEvent(new CustomEvent('highlightEvent', { detail: { id: ev.id, coords: ev.coords } }));
                              }
                            }}
                            className={cn(
                              'w-full text-left flex flex-col gap-0.5 px-3 py-2.5 rounded-lg transition-colors border',
                              isSelected
                                ? (isDark ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50/70 border-blue-400/80')
                                : (isDark ? 'bg-zinc-800/60 border-transparent hover:border-zinc-700' : 'bg-white border-transparent hover:border-slate-200'),
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-2.5 h-2.5 shrink-0 text-blue-500" strokeWidth={2} />
                              <span className={cn('text-[11px] font-normal flex-1 line-clamp-2', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                                {ev.address}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className={cn('w-2.5 h-2.5 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')} strokeWidth={1.75} />
                              <span className={cn('text-[10px] font-medium tabular-nums', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                                {displayTime}
                              </span>
                              <cfg.Icon size={11} strokeWidth={2} style={{ color: cfg.color }} className="shrink-0 ml-1" />
                              <span className={cn('text-[11px] font-semibold', isDark ? 'text-zinc-300' : 'text-slate-600')}>
                                {ev.detail}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Indicador de scroll */}
                <AnimatePresence>
                  {showScrollHint && tripEvents && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none rounded-b-md overflow-hidden"
                    >
                      <div className={cn('w-full h-6 bg-gradient-to-t to-transparent', isDark ? 'from-zinc-900 via-zinc-900/60' : 'from-white via-white/60')} />
                      <div className={cn('w-full flex justify-center pb-1.5', isDark ? 'bg-zinc-900' : 'bg-white')}>
                        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                          <ChevronDown className={cn('w-4 h-4', isDark ? 'text-zinc-400' : 'text-slate-400')} strokeWidth={2.5} />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mapa ── */}
      <div className="flex-1 min-w-0 p-3 min-h-0">
        <div
          ref={mapContainerRef}
          className={cn(
            'relative w-full h-full rounded-md overflow-hidden border',
            isDark ? 'border-zinc-800' : 'border-neutral-200',
          )}
        >
          <VehicleTrackingMap
            vehicle={vehicle}
            isDark={isDark}
            activeEventTypes={activeEventTypes}
            eventGroups={tripEvents?.groups}
            backgroundRoutes={selectedTripId ? backgroundRoutes : undefined}
          />

          {/* Modal de descarga */}
          {showDownloadModal && (
            <TripDownloadModal
              vehicle={vehicle}
              trip={selectedTrip}
              eventGroups={tripEvents?.groups}
              mapRef={mapContainerRef}
              isDark={isDark}
              onClose={() => setShowDownloadModal(false)}
            />
          )}

          {/* Botones de acción flotantes — esquina inferior izquierda */}
          <div className="absolute bottom-3 left-3 z-[1000] flex flex-row gap-1.5 pointer-events-auto">
            <div className="relative group">
              <button
                onClick={handleShare}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                  'backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.12)] border',
                  shareOk
                    ? (isDark ? 'bg-emerald-900/80 border-emerald-700/60 text-emerald-400' : 'bg-emerald-50/90 border-emerald-200 text-emerald-500')
                    : (isDark
                        ? 'bg-zinc-900/90 border-zinc-700/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/95'
                        : 'bg-white/90 border-white/60 text-slate-500 hover:text-slate-800 hover:bg-white'),
                )}
              >
                {shareOk
                  ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  : <Share2 className="w-3.5 h-3.5" strokeWidth={2} />}
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block pointer-events-none z-[10000]">
                <div className={cn('text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>
                  Compartir viaje
                  <div className={cn('absolute left-1/2 -translate-x-1/2 top-full border-[4px] border-transparent', isDark ? 'border-t-zinc-700' : 'border-t-slate-800')} />
                </div>
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={handleDownload}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                  'backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.12)] border',
                  dlOk
                    ? (isDark ? 'bg-emerald-900/80 border-emerald-700/60 text-emerald-400' : 'bg-emerald-50/90 border-emerald-200 text-emerald-500')
                    : (isDark
                        ? 'bg-zinc-900/90 border-zinc-700/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/95'
                        : 'bg-white/90 border-white/60 text-slate-500 hover:text-slate-800 hover:bg-white'),
                )}
              >
                {dlOk
                  ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  : <Download className="w-3.5 h-3.5" strokeWidth={2} />}
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block pointer-events-none z-[10000]">
                <div className={cn('text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>
                  Descargar ruta
                  <div className={cn('absolute left-1/2 -translate-x-1/2 top-full border-[4px] border-transparent', isDark ? 'border-t-zinc-700' : 'border-t-slate-800')} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
