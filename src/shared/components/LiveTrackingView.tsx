import { useCallback, useEffect, useMemo, useRef, useState, type ElementType } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video, VideoOff, Power, Bike, Car, Truck, Bus, Settings2, LocateFixed, MapPin,
  Eye, EyeOff, RefreshCw, Copy, ChevronDown, Clock, X, Filter,
  Gauge, ChevronsDown, Zap, Navigation2,
} from 'lucide-react';
import { cn, formatLastSeenWithSecs } from '../lib/utils';
import { getVehicleGpsStyle } from './fleet/fleetUtils';
import type { Vehicle } from '../lib/data';
import { useVehicles } from '../lib/VehicleContext';
import { useTheme } from '../lib/ThemeContext';
import { getCamerasForVehicle } from '../lib/cameraData';
import { CameraPanel } from './live/CameraPanel';
import { createCustomIcon } from '../lib/mapIcons';
import { createRouteMarkerIcon, createEventMarkerIcon, injectFlowCss } from './vehicle-detail/VehicleTrackingMap';
import type { TripEventType, TripEventGroup, TripEventInstance, EventSeverity } from './vehicle-detail/TripPanel';
import { Checkbox } from './ui/Checkbox';

const VEHICLE_ICON = { motorcycle: Bike, truck: Truck, bus: Bus, machinery: Settings2, car: Car };

// ─── Config visual de tipos de evento (mismo estándar que VehicleTripView) ─
const EVENT_CONFIG: Record<TripEventType, { label: string; color: string; Icon: ElementType }> = {
  speeding:           { label: 'Exceso de velocidad', color: '#ef4444', Icon: Gauge        },
  hard_braking:       { label: 'Frenado brusco',      color: '#f59e0b', Icon: ChevronsDown },
  harsh_acceleration: { label: 'Aceleración brusca',  color: '#f97316', Icon: Zap          },
  sharp_turn:         { label: 'Giro brusco',         color: '#a855f7', Icon: Navigation2  },
};

const EVENT_TYPE_ORDER: TripEventType[] = ['harsh_acceleration', 'speeding', 'sharp_turn', 'hard_braking'];

function VehicleFollower({ position, active }: { position: [number, number]; active: boolean }) {
  const map = useMap();
  const firstRef = useRef(true);
  useEffect(() => {
    if (!active) return;
    if (firstRef.current) {
      map.setView(position, 16, { animate: false });
      firstRef.current = false;
    } else {
      map.panTo(position, { animate: true, duration: 1.5 });
    }
  }, [map, position, active]);
  return null;
}

// Encuadra el recorrido completo una sola vez al activar un panel
function FitTrailBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(points);
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.18), { animate: true, duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

// Centra el mapa en el punto seleccionado desde una lista (evento o posición)
function FlyToPoint({ target, minZoom = 15 }: { target: [number, number] | null; minZoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), minZoom), { animate: true, duration: 0.5 });
  }, [map, target, minZoom]);
  return null;
}

// Marcador de posición GPS seleccionada — dot azul con anillo pulsante
function createPositionMarkerIcon(): L.DivIcon {
  const color = '#3b82f6';
  const html = `
    <div style="position:relative;width:18px;height:18px;">
      <div class="event-ring-expand" style="position:absolute;inset:-3px;border-radius:50%;border:2px solid ${color};pointer-events:none;"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.35);"></div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [18, 18], iconAnchor: [9, 9] });
}

// ─── Recorrido en vivo ──────────────────────────────────────────────────────
interface TrailPoint {
  pos: [number, number];
  time: Date;
}

const TRAIL_POINTS = 20;
const TRAIL_INTERVAL_SEC = 30;

// Historial sintético: puntos hacia atrás desde la posición actual, en línea
// mayormente recta (calle) con jitter leve, cada 30 s. Los puntos nuevos se
// agregan en vivo cuando el vehículo se mueve (VehicleContext).
function generateInitialTrail(vehicle: Vehicle): TrailPoint[] {
  const seed = parseInt(vehicle.id, 10) || 1;
  const angle = (seed % 8) * (Math.PI / 4);
  const step = 0.0016;
  const now = Date.now();
  const [lat, lng] = vehicle.position as [number, number];
  const pts: TrailPoint[] = [];
  for (let i = TRAIL_POINTS - 1; i >= 1; i--) {
    const jitter = Math.sin(seed * 7 + i * 1.3) * 0.0003;
    pts.push({
      pos: [lat - Math.sin(angle) * step * i + jitter, lng - Math.cos(angle) * step * i + jitter],
      time: new Date(now - i * TRAIL_INTERVAL_SEC * 1000),
    });
  }
  pts.push({ pos: [lat, lng], time: new Date(now) });
  return pts;
}

// Eventos mock anclados a puntos del recorrido inicial (histórico)
function generateLiveEvents(trail: TrailPoint[], vehicle: Vehicle): TripEventGroup[] {
  const seed = parseInt(vehicle.id, 10) || 1;
  const count = 5 + (seed % 4);
  const streetPrefix = vehicle.address.split(',')[0];
  const byType = new Map<TripEventType, TripEventInstance[]>();
  const usedIdx = new Set<number>();

  for (let k = 0; k < count; k++) {
    let idx = 1 + ((seed * 3 + k * 5) % (trail.length - 2));
    while (usedIdx.has(idx)) idx = (idx % (trail.length - 2)) + 1;
    usedIdx.add(idx);

    const type = EVENT_TYPE_ORDER[(seed + k) % EVENT_TYPE_ORDER.length];
    const p = trail[idx];
    const g = (0.6 + ((seed + k * 3) % 7) / 10).toFixed(1);
    const detail =
      type === 'speeding'   ? `${78 + ((seed + k * 5) % 20)} km/h`
      : type === 'sharp_turn' ? `${g} g lateral`
      : `${g} g`;
    const severity: EventSeverity = Number(g) >= 1.1 ? 'high' : Number(g) >= 0.8 ? 'medium' : 'low';

    const inst: TripEventInstance = {
      id: `live-ev-${vehicle.id}-${k}`,
      time: p.time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      coords: p.pos,
      severity,
      detail,
      address: `${streetPrefix} — Tramo ${trail.length - 1 - idx}`,
    };
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type)!.push(inst);
  }

  return EVENT_TYPE_ORDER.filter(t => byType.has(t)).map(t => ({
    type: t,
    instances: byType.get(t)!.sort((a, b) => a.time.localeCompare(b.time)),
  }));
}

function fmtDateTime(d: Date) {
  return d.toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

type LivePanel = 'none' | 'positions' | 'events';

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

  const VehicleIcon = VEHICLE_ICON[vehicle.type as keyof typeof VEHICLE_ICON] ?? Car;
  const gpsStyle    = getVehicleGpsStyle(vehicle, isDark);

  useEffect(() => { injectFlowCss(); }, []);

  // ─── Panel activo (posiciones / eventos — excluyentes) ───────────────────
  const [activePanel, setActivePanel] = useState<LivePanel>('none');
  const showPositions = activePanel === 'positions';
  const showEvents    = activePanel === 'events';
  const showTrail     = activePanel !== 'none';

  // ─── Recorrido ────────────────────────────────────────────────────────────
  const [trail, setTrail] = useState<TrailPoint[]>(() => generateInitialTrail(initialVehicle));
  const [eventGroups] = useState<TripEventGroup[]>(() => generateLiveEvents(trail, initialVehicle));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setTrail(prev => {
      const last = prev[prev.length - 1];
      if (last.pos[0] === vehicle.position[0] && last.pos[1] === vehicle.position[1]) return prev;
      return [...prev, { pos: vehicle.position as [number, number], time: new Date() }];
    });
  }, [vehicle.position[0], vehicle.position[1]]);

  const trailCoords = useMemo(() => trail.map(p => p.pos), [trail]);

  const positionHistory = useMemo(() => {
    const streetPrefix = vehicle.address.split(',')[0];
    return trail.map((p, i, arr) => ({
      idx: i,
      pos: p.pos,
      coords: `${p.pos[0].toFixed(4)}, ${p.pos[1].toFixed(4)}`,
      dateTime: fmtDateTime(p.time),
      address: i === arr.length - 1 ? vehicle.address : `${streetPrefix} — Tramo ${arr.length - 1 - i}`,
      isLast: i === arr.length - 1,
    })).reverse();
  }, [trail, vehicle.address]);

  // ─── Posición seleccionada: click en un ítem → flyTo preciso en el mapa ──
  const [selectedPosIdx, setSelectedPosIdx] = useState<number | null>(null);
  const selectedPosCoords = useMemo<[number, number] | null>(
    () => selectedPosIdx !== null ? trail[selectedPosIdx]?.pos ?? null : null,
    [selectedPosIdx, trail],
  );

  useEffect(() => {
    if (activePanel !== 'positions') setSelectedPosIdx(null);
  }, [activePanel]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(prev => prev === key ? null : prev), 1500);
  };

  // ─── Eventos: filtros y selección ─────────────────────────────────────────
  const [activeEventTypes, setActiveEventTypes] = useState<Set<TripEventType>>(new Set());
  const [eventFilterOpen, setEventFilterOpen]   = useState(false);
  const [selectedEventId, setSelectedEventId]   = useState<string | null>(null);
  const filterBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePanel !== 'events') {
      setSelectedEventId(null);
      setEventFilterOpen(false);
    }
  }, [activePanel]);

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

  const totalEvents = useMemo(() => eventGroups.reduce((s, g) => s + g.instances.length, 0), [eventGroups]);

  const filteredInstances = useMemo(() => {
    const groups = activeEventTypes.size === 0
      ? eventGroups
      : eventGroups.filter(g => activeEventTypes.has(g.type));
    return groups
      .flatMap(g => g.instances.map(inst => ({ ...inst, groupType: g.type as TripEventType })))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [eventGroups, activeEventTypes]);

  const selectedEventCoords = useMemo(() => {
    if (!selectedEventId) return null;
    for (const g of eventGroups) {
      const found = g.instances.find(i => i.id === selectedEventId);
      if (found) return found.coords;
    }
    return null;
  }, [selectedEventId, eventGroups]);

  function toggleEventType(type: TripEventType) {
    setActiveEventTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
    setSelectedEventId(null);
  }

  // ─── Scroll hints ─────────────────────────────────────────────────────────
  const [posShowScrollHint, setPosShowScrollHint] = useState(false);
  const posListRef = useRef<HTMLDivElement>(null);
  const posCheckScroll = useCallback(() => {
    const el = posListRef.current;
    if (!el) return;
    setPosShowScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);
  useEffect(() => { setTimeout(posCheckScroll, 80); }, [positionHistory, posCheckScroll]);
  useEffect(() => { setTimeout(posCheckScroll, 120); }, [activePanel, posCheckScroll]);

  const [evShowScrollHint, setEvShowScrollHint] = useState(false);
  const evListRef = useRef<HTMLDivElement>(null);
  const evCheckScroll = useCallback(() => {
    const el = evListRef.current;
    if (!el) return;
    setEvShowScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);
  useEffect(() => { setTimeout(evCheckScroll, 120); }, [activePanel, activeEventTypes, evCheckScroll]);

  const tileUrl = isDark
    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  // ─── Panel de posiciones ──────────────────────────────────────────────────
  const positionsPanelCard = (
    <div className={cn('flex-1 rounded-xl border flex flex-col min-h-0 overflow-hidden', isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70')}>
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
        <span className={cn('text-[9.5px] font-semibold uppercase tracking-wider', isDark ? 'text-zinc-500' : 'text-slate-400')}>
          Posiciones <span className={cn('ml-1 text-[10px]', isDark ? 'text-zinc-600' : 'text-slate-300')}>{positionHistory.length}</span>
        </span>
        <span className={cn('w-7 h-7 flex items-center justify-center rounded-lg shrink-0', isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-slate-400')}>
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
        </span>
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden rounded-b-xl">
        <div ref={posListRef} onScroll={posCheckScroll} className="absolute inset-0 overflow-y-auto px-3 py-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          <div className="flex flex-col gap-1.5 pb-6">
            {positionHistory.map(item => {
              const isSelected = selectedPosIdx === item.idx;
              return (
              <div
                key={item.idx}
                onClick={() => setSelectedPosIdx(prev => prev === item.idx ? null : item.idx)}
                className={cn(
                  'w-full text-left flex flex-col gap-0.5 px-3 py-2.5 rounded-lg transition-colors border cursor-pointer',
                  isSelected
                    ? (isDark ? 'bg-blue-900/20 border-blue-500/50 ring-1 ring-blue-500/40' : 'bg-blue-50/70 border-blue-400/80 ring-1 ring-blue-400/40')
                    : item.isLast
                      ? (isDark ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50/70 border-blue-400/80')
                      : (isDark ? 'bg-zinc-800/60 border-transparent hover:border-zinc-700' : 'bg-white border-transparent hover:border-slate-200'),
                )}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={cn('w-2.5 h-2.5 shrink-0', (item.isLast || isSelected) ? 'text-blue-500' : (isDark ? 'text-zinc-600' : 'text-slate-300'))} strokeWidth={2} />
                  <span className={cn('text-[10px] font-medium tabular-nums truncate', isDark ? 'text-zinc-400' : 'text-slate-500')}>{item.dateTime}</span>
                  {item.isLast && <span className="text-[10px] font-semibold text-blue-500 shrink-0">Última</span>}
                </div>
                <span className={cn('text-[11px] font-normal line-clamp-2', (item.isLast || isSelected) ? 'text-blue-500' : (isDark ? 'text-zinc-200' : 'text-slate-700'))}>{item.address}</span>
                <div className="relative flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyText(item.coords, `pos-${item.idx}`); }}
                    className={cn('group flex items-center gap-1 min-w-0 text-left text-[10px] font-medium transition-colors hover:underline', isDark ? 'text-zinc-500 hover:text-blue-400' : 'text-slate-400 hover:text-brand')}
                  >
                    <span className="truncate">{item.coords}</span>
                    <Copy className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" strokeWidth={1.5} />
                  </button>
                  {copiedKey === `pos-${item.idx}` && (
                    <span className={cn('absolute -top-7 left-0 text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-50', isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-800 text-white')}>Copiado ✓</span>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
        <AnimatePresence>
          {posShowScrollHint && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none overflow-hidden"
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
  );

  // ─── Panel de eventos ─────────────────────────────────────────────────────
  const eventsPanelCard = (
    <div className={cn('flex-1 rounded-xl border flex flex-col min-h-0 overflow-hidden', isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70')}>
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
        <span className={cn('text-[9.5px] font-semibold uppercase tracking-wider', isDark ? 'text-zinc-500' : 'text-slate-400')}>
          Eventos del recorrido <span className={cn('ml-1 text-[10px]', isDark ? 'text-zinc-600' : 'text-slate-300')}>{totalEvents}</span>
        </span>
        <button
          onClick={() => setActivePanel('none')}
          className={cn(
            'w-6 h-6 rounded-md flex items-center justify-center transition-colors',
            isDark ? 'hover:bg-zinc-700/70 text-zinc-500' : 'hover:bg-neutral-100 text-slate-400',
          )}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filtros — mismo estándar que "Eventos del viaje" */}
      <div className="relative z-[60] px-1.5 py-1 shrink-0 flex items-center gap-1">
        <button
          onClick={() => { setActiveEventTypes(new Set()); setEventFilterOpen(false); setSelectedEventId(null); }}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors',
            activeEventTypes.size === 0
              ? (isDark ? 'text-zinc-100 bg-zinc-800' : 'text-neutral-900 bg-neutral-100')
              : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70'),
          )}
        >
          <span>Todos</span>
        </button>

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

                {eventGroups.map(group => {
                  const cfg       = EVENT_CONFIG[group.type];
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
                      onClick={() => { setActiveEventTypes(new Set()); setSelectedEventId(null); }}
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

      {/* Lista de eventos */}
      <div className="relative flex-1 min-h-0 overflow-hidden rounded-b-xl">
        <div ref={evListRef} onScroll={evCheckScroll} className="absolute inset-0 overflow-y-auto px-3 py-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
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
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEventId(prev => prev === ev.id ? null : ev.id)}
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
                        {ev.time}
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
        <AnimatePresence>
          {evShowScrollHint && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none overflow-hidden"
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
  );

  // ─── Ubicación (dirección + coords) — inline o en segunda fila según ancho ─
  const locationBlock = (
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
  );

  return (
    <div className={cn('flex w-full h-full overflow-hidden', isDark ? 'bg-zinc-950' : 'bg-neutral-100')}>

      {/* ── Panel izquierdo: info del vehículo + cámaras ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 pr-1.5 gap-3.5">

        {/* Card 1 — Info de la unidad */}
        <div className={cn(
          'rounded-xl border shrink-0 @container',
          isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
        )}>
          <div className="flex flex-col px-4 py-3">
            {/* Fila 1: identidad + (ubicación inline si hay espacio) + botones */}
            <div className="flex items-center gap-2.5">

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

            {/* Ubicación inline — solo cuando la card es suficientemente ancha */}
            <div className="hidden @[640px]:flex items-center gap-2.5 flex-1 min-w-0 self-stretch">
              <div className={cn('self-stretch w-px shrink-0 mx-1', isDark ? 'bg-zinc-800' : 'bg-neutral-100')} />
              {locationBlock}
              <div className={cn('self-stretch w-px shrink-0 mx-1', isDark ? 'bg-zinc-800' : 'bg-neutral-100')} />
            </div>

            {/* Toggles de paneles: Posiciones / Eventos */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              {([
                { key: 'positions' as LivePanel, label: 'Posiciones' },
                { key: 'events' as LivePanel,    label: 'Eventos' },
              ]).map(({ key, label }) => {
                const on = activePanel === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActivePanel(prev => prev === key ? 'none' : key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all',
                      on
                        ? (isDark ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'bg-blue-50 text-blue-600 border-blue-200')
                        : (isDark ? 'text-zinc-400 border-zinc-700 hover:bg-zinc-800' : 'text-slate-500 border-slate-200 hover:bg-slate-50'),
                    )}
                  >
                    {on
                      ? <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                      : <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} />}
                    {label}
                  </button>
                );
              })}
            </div>
            </div>

            {/* Fila 2: ubicación debajo de la identidad — cuando el espacio es pequeño */}
            <div className={cn('@[640px]:hidden flex border-t mt-2.5 pt-2.5', isDark ? 'border-zinc-800' : 'border-neutral-100')}>
              {locationBlock}
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

      {/* ── Panel lateral: posiciones o eventos ── */}
      <AnimatePresence mode="wait">
        {activePanel !== 'none' && (
          <motion.div
            key={activePanel}
            initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -12, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-[272px] flex-none flex flex-col min-h-0 py-3 px-1.5"
          >
            {showPositions ? positionsPanelCard : eventsPanelCard}
          </motion.div>
        )}
      </AnimatePresence>

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
            <VehicleFollower position={vehicle.position as [number, number]} active={!showTrail} />
            {showTrail && <FitTrailBounds points={trailCoords} />}
            {showEvents && <FlyToPoint target={selectedEventCoords} />}
            {showPositions && <FlyToPoint target={selectedPosCoords} minZoom={17} />}
            {showPositions && selectedPosCoords && (
              <Marker position={selectedPosCoords} icon={createPositionMarkerIcon()} zIndexOffset={400} />
            )}
            {showTrail && trailCoords.length > 1 && (
              <>
                <Polyline positions={trailCoords} pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.85, dashArray: '14 10', lineCap: 'round' }} />
                <Marker position={trailCoords[0]} icon={createRouteMarkerIcon('origin')} />
              </>
            )}
            {showEvents && eventGroups.flatMap(group => {
              const isActive = activeEventTypes.size === 0 || activeEventTypes.has(group.type);
              return group.instances.map(inst => {
                const isSelected = selectedEventId === inst.id;
                return (
                  <Marker
                    key={`${inst.id}-${isSelected}`}
                    position={inst.coords}
                    icon={createEventMarkerIcon(group.type, isActive, 1, isSelected, 16)}
                    eventHandlers={{ click: () => setSelectedEventId(prev => prev === inst.id ? null : inst.id) }}
                  />
                );
              });
            })}
            <Marker position={vehicle.position as [number, number]} icon={marker} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
