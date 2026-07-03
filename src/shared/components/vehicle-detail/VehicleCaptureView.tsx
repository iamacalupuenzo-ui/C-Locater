import { useEffect, useMemo, Fragment, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, RefreshCw, MapPin, Copy, ChevronDown, WifiOff, Radio, ArrowRight, Smartphone, Wifi, AlertTriangle, GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import { VehicleDetailPanel } from './VehicleDetailPanel';
import { VehicleTrackingMap } from './VehicleTrackingMap';

type DockPosition = 'left' | 'right' | 'below-sidebar';

function DockLeftSvg() {
  return (
    <svg width="38" height="26" viewBox="0 0 38 26" fill="none">
      <rect x="0.5" y="0.5" width="37" height="25" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="2" y="2" width="10" height="22" rx="2" fill="currentColor" fillOpacity="0.12" />
      <rect x="14" y="2" width="8" height="22" rx="2" fill="currentColor" fillOpacity="0.55" />
      <rect x="24" y="2" width="12" height="22" rx="2" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}

function DockRightSvg() {
  return (
    <svg width="38" height="26" viewBox="0 0 38 26" fill="none">
      <rect x="0.5" y="0.5" width="37" height="25" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="2" y="2" width="10" height="22" rx="2" fill="currentColor" fillOpacity="0.12" />
      <rect x="14" y="2" width="12" height="22" rx="2" fill="currentColor" fillOpacity="0.1" />
      <rect x="28" y="2" width="8" height="22" rx="2" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}

function DockBelowSvg() {
  return (
    <svg width="38" height="26" viewBox="0 0 38 26" fill="none">
      <rect x="0.5" y="0.5" width="37" height="25" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="2" y="2" width="10" height="12" rx="2" fill="currentColor" fillOpacity="0.12" />
      <rect x="2" y="16" width="10" height="8" rx="2" fill="currentColor" fillOpacity="0.55" />
      <rect x="14" y="2" width="22" height="22" rx="2" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}

interface VehicleCaptureViewProps {
  vehicle: Vehicle;
  onBack: () => void;
  isDark?: boolean;
}

// ─── Rutas reales de captura — Lima, siguiendo avenidas principales ────────

// Captura 0: Av. Túpac Amaru, Comas → Av. Colonial, Cercado (N→S)
const CAPTURE_ROUTE_0: [number, number][] = [
  [-11.9385, -77.0534],
  [-11.9460, -77.0535],
  [-11.9535, -77.0535],
  [-11.9610, -77.0536],
  [-11.9685, -77.0536],
  [-11.9760, -77.0537],
  [-11.9835, -77.0537],
  [-11.9905, -77.0535],
  [-11.9975, -77.0530],
  [-12.0048, -77.0523],
  [-12.0125, -77.0516],
  [-12.0205, -77.0511],
  [-12.0288, -77.0507],
  [-12.0365, -77.0503],
  [-12.0420, -77.0500],
];

// Captura 1: Av. Colonial, Callao → Av. Brasil, Breña (W→E, 21 puntos)
const CAPTURE_ROUTE_1: [number, number][] = [
  [-12.0498, -77.1082],
  [-12.0499, -77.1060],
  [-12.0500, -77.1038],
  [-12.0501, -77.1015],
  [-12.0501, -77.0993],
  [-12.0501, -77.0970],
  [-12.0501, -77.0945],
  [-12.0501, -77.0920],
  [-12.0500, -77.0895],
  [-12.0500, -77.0870],
  [-12.0500, -77.0855],
  [-12.0500, -77.0830],
  [-12.0499, -77.0805],
  [-12.0499, -77.0780],
  [-12.0499, -77.0755],
  [-12.0499, -77.0740],
  [-12.0498, -77.0715],
  [-12.0498, -77.0690],
  [-12.0497, -77.0665],
  [-12.0497, -77.0640],
  [-12.0497, -77.0625],
];

// Captura 2: Av. La Marina, San Miguel → Av. Brasil, Pueblo Libre (W→E vía La Marina, 22 puntos)
const CAPTURE_ROUTE_2: [number, number][] = [
  [-12.0691, -77.0793],
  [-12.0690, -77.0778],
  [-12.0688, -77.0762],
  [-12.0685, -77.0740],
  [-12.0683, -77.0725],
  [-12.0680, -77.0710],
  [-12.0678, -77.0685],
  [-12.0676, -77.0670],
  [-12.0673, -77.0650],
  [-12.0670, -77.0630],
  [-12.0667, -77.0612],
  [-12.0664, -77.0593],
  [-12.0660, -77.0575],
  [-12.0657, -77.0558],
  [-12.0653, -77.0540],
  [-12.0648, -77.0520],
  [-12.0645, -77.0505],
  [-12.0642, -77.0490],
  [-12.0638, -77.0480],
  [-12.0635, -77.0465],
];

// Captura 3: Puente Piedra → Los Olivos (N→S por Panamericana Norte, 21 puntos)
const CAPTURE_ROUTE_3: [number, number][] = [
  [-11.8665, -77.0752],
  [-11.8695, -77.0752],
  [-11.8730, -77.0751],
  [-11.8766, -77.0750],
  [-11.8802, -77.0749],
  [-11.8840, -77.0748],
  [-11.8868, -77.0747],
  [-11.8905, -77.0746],
  [-11.8940, -77.0744],
  [-11.8972, -77.0742],
  [-11.9008, -77.0738],
  [-11.9045, -77.0735],
  [-11.9077, -77.0733],
  [-11.9112, -77.0730],
  [-11.9150, -77.0725],
  [-11.9183, -77.0720],
  [-11.9220, -77.0715],
  [-11.9260, -77.0708],
  [-11.9290, -77.0702],
  [-11.9345, -77.0690],
  [-11.9397, -77.0680],
];

// Captura 4: Jr. de la Unión, Centro → Av. Arequipa, San Isidro (S→E, 21 puntos)
const CAPTURE_ROUTE_4: [number, number][] = [
  [-12.0468, -77.0283],
  [-12.0485, -77.0285],
  [-12.0503, -77.0290],
  [-12.0520, -77.0295],
  [-12.0540, -77.0300],
  [-12.0560, -77.0305],
  [-12.0580, -77.0308],
  [-12.0600, -77.0312],
  [-12.0620, -77.0316],
  [-12.0640, -77.0320],
  [-12.0660, -77.0324],
  [-12.0680, -77.0328],
  [-12.0700, -77.0332],
  [-12.0725, -77.0338],
  [-12.0750, -77.0342],
  [-12.0760, -77.0345],
  [-12.0785, -77.0350],
  [-12.0810, -77.0353],
  [-12.0820, -77.0355],
  [-12.0880, -77.0360],
  [-12.0940, -77.0365],
];

// Captura 5: Av. Benavides, Miraflores → Av. Javier Prado, Surco (W→E, 20 puntos)
const CAPTURE_ROUTE_5: [number, number][] = [
  [-12.1317, -77.0055],
  [-12.1316, -77.0040],
  [-12.1315, -77.0023],
  [-12.1313, -77.0005],
  [-12.1310, -76.9970],
  [-12.1308, -76.9955],
  [-12.1306, -76.9940],
  [-12.1304, -76.9925],
  [-12.1300, -76.9885],
  [-12.1298, -76.9870],
  [-12.1296, -76.9850],
  [-12.1294, -76.9830],
  [-12.1290, -76.9800],
  [-12.1288, -76.9780],
  [-12.1286, -76.9760],
  [-12.1284, -76.9740],
  [-12.1280, -76.9700],
  [-12.1275, -76.9675],
  [-12.1270, -76.9650],
  [-12.1265, -76.9620],
];

// Captura 6: Av. Arequipa, San Isidro → Av. Brasil, Breña (S→N, 21 puntos)
const CAPTURE_ROUTE_6: [number, number][] = [
  [-12.0974, -77.0359],
  [-12.0955, -77.0360],
  [-12.0935, -77.0360],
  [-12.0910, -77.0360],
  [-12.0890, -77.0360],
  [-12.0870, -77.0360],
  [-12.0845, -77.0360],
  [-12.0825, -77.0360],
  [-12.0805, -77.0360],
  [-12.0780, -77.0360],
  [-12.0760, -77.0360],
  [-12.0740, -77.0360],
  [-12.0715, -77.0360],
  [-12.0695, -77.0360],
  [-12.0675, -77.0360],
  [-12.0650, -77.0360],
  [-12.0630, -77.0360],
  [-12.0610, -77.0360],
  [-12.0585, -77.0360],
  [-12.0550, -77.0360],
  [-12.0520, -77.0360],
];

// Captura 7: Carretera Central, Ate → Av. Javier Prado, San Borja (W→E, 22 puntos)
const CAPTURE_ROUTE_7: [number, number][] = [
  [-12.0587, -76.9178],
  [-12.0590, -76.9193],
  [-12.0593, -76.9210],
  [-12.0596, -76.9225],
  [-12.0600, -76.9240],
  [-12.0605, -76.9255],
  [-12.0610, -76.9270],
  [-12.0615, -76.9285],
  [-12.0620, -76.9300],
  [-12.0628, -76.9320],
  [-12.0635, -76.9340],
  [-12.0640, -76.9355],
  [-12.0645, -76.9360],
  [-12.0652, -76.9380],
  [-12.0660, -76.9400],
  [-12.0670, -76.9420],
  [-12.0682, -76.9440],
  [-12.0695, -76.9460],
  [-12.0700, -76.9480],
  [-12.0718, -76.9510],
  [-12.0735, -76.9540],
  [-12.0770, -76.9600],
];

const CAPTURE_ROUTES: Record<number, { originLabel: string; originCoords: [number, number]; traveledCoords: [number, number][] }> = {
  0: { originLabel: 'Av. Túpac Amaru Km 8, Comas',              originCoords: [-11.9385, -77.0534], traveledCoords: CAPTURE_ROUTE_0 },
  1: { originLabel: 'Av. Colonial 100, Callao',                 originCoords: [-12.0498, -77.1082], traveledCoords: CAPTURE_ROUTE_1 },
  2: { originLabel: 'Av. La Marina 2000, San Miguel',          originCoords: [-12.0691, -77.0793], traveledCoords: CAPTURE_ROUTE_2 },
  3: { originLabel: 'Panamericana Norte Km 15, Puente Piedra',  originCoords: [-11.8665, -77.0752], traveledCoords: CAPTURE_ROUTE_3 },
  4: { originLabel: 'Jr. de la Unión 1045, Lima Centro',        originCoords: [-12.0468, -77.0283], traveledCoords: CAPTURE_ROUTE_4 },
  5: { originLabel: 'Av. Benavides 5040, Miraflores',           originCoords: [-12.1317, -77.0055], traveledCoords: CAPTURE_ROUTE_5 },
  6: { originLabel: 'Av. Arequipa 3800, San Isidro',            originCoords: [-12.0974, -77.0359], traveledCoords: CAPTURE_ROUTE_6 },
  7: { originLabel: 'Carretera Central Km 42, Ate',             originCoords: [-12.0587, -76.9178], traveledCoords: CAPTURE_ROUTE_7 },
};

function generateCaptureRoute(vehicle: Vehicle) {
  const seed = parseInt(vehicle.id, 10) || 1;
  const routeIdx = seed % 8;
  const route = CAPTURE_ROUTES[routeIdx];

  return {
    tripId: `capture-${vehicle.id}`,
    status: 'in-progress' as const,
    roaming: true,
    origin: route.originCoords,
    destination: vehicle.position,
    originLabel: route.originLabel,
    destLabel: 'Posición actual',
    traveledCoords: route.traveledCoords,
  };
}

interface PositionHistoryItem {
  coords: string;
  dateTime: string;
  address: string;
  isLast: boolean;
}

export function VehicleCaptureView({ vehicle, onBack, isDark = false }: VehicleCaptureViewProps) {
  const captureRoute = useMemo(() => generateCaptureRoute(vehicle), [vehicle]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPositions, setShowPositions] = useState(true);
  const [positionsDock, setPositionsDock] = useState<DockPosition>('left');
  const [showDockPicker, setShowDockPicker] = useState(false);
  const dockPickerRef = useRef<HTMLDivElement>(null);

  function fmtDateTime(d: Date) {
    return d.toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  const positionHistory: PositionHistoryItem[] = useMemo(() => {
    const points = captureRoute.traveledCoords ?? [];
    if (points.length === 0) return [];
    const now = Date.now();
    const interval = 30;
    const streetPrefix = captureRoute.originLabel.split(',')[0];
    return points.map((coords, i, arr) => ({
      coords: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`,
      dateTime: fmtDateTime(new Date(now - (arr.length - 1 - i) * interval * 1000)),
      address:
        i === 0
          ? captureRoute.originLabel
          : i === arr.length - 1
            ? vehicle.address
            : `${streetPrefix} — Tramo ${arr.length - i}`,
      isLast: i === arr.length - 1,
    })).reverse();
  }, [captureRoute, vehicle.address]);

  const [posShowScrollHint, setPosShowScrollHint] = useState(false);
  const posListRef = useRef<HTMLDivElement>(null);

  const posCheckScroll = useCallback(() => {
    const el = posListRef.current;
    if (!el) return;
    setPosShowScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  useEffect(() => { setTimeout(posCheckScroll, 80); }, [positionHistory, posCheckScroll]);
  useEffect(() => { setTimeout(posCheckScroll, 120); }, [positionsDock, showPositions]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(prev => prev === key ? null : prev), 1500);
  };

  useEffect(() => {
    if (!showDockPicker) return;
    const handler = (e: MouseEvent) => {
      if (dockPickerRef.current && !dockPickerRef.current.contains(e.target as Node)) {
        setShowDockPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDockPicker]);

  const layoutRef = useRef<HTMLDivElement>(null);
  const [hasEnoughHeight, setHasEnoughHeight] = useState(true);

  useEffect(() => {
    const el = layoutRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const ok = entry.contentRect.height >= 480;
      setHasEnoughHeight(ok);
      if (!ok) setPositionsDock(prev => prev === 'below-sidebar' ? 'left' : prev);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ─── GPS availability modals ──────────────────────────────────────────────
  const devices = vehicle.gpsDevices ?? [];
  const primaryDevice = devices[0];
  const availableGpsIdx = devices.findIndex(d => d.reportStatus === 'reporting');
  const hasAvailableGps = availableGpsIdx >= 0;
  const allDisconnected = devices.length > 0 && devices.every(d => d.reportStatus === 'disconnected' || d.reportStatus === 'no-signal');

  type GpsModalType = 'none' | 'gps-unavailable' | 'switch-gps';
  const [gpsModal, setGpsModal] = useState<GpsModalType>('none');
  const [gpsSwitchTo, setGpsSwitchTo] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (devices.length === 0) return;

    if (primaryDevice?.reportStatus === 'disconnected' && !hasAvailableGps) {
      setGpsModal('gps-unavailable');
    } else if (primaryDevice?.reportStatus !== 'reporting' && hasAvailableGps && devices.length > 1) {
      setGpsModal('switch-gps');
    }
  }, []);

  const handleSwitchGps = () => {
    setGpsSwitchTo(availableGpsIdx);
    setGpsModal('none');
  };

  const captureStages = [
    { id: 'inicio',     label: 'Inicio de captura', timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }), state: 'done'    as const },
    { id: 'en-proceso', label: 'En proceso',         timestamp: undefined,                                                                      state: 'active'  as const },
    { id: 'finalizado', label: 'Finalizado',          timestamp: undefined,                                                                      state: 'pending' as const },
  ];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('tripRouteSelected', { detail: captureRoute }));
    return () => {
      window.dispatchEvent(new CustomEvent('tripRouteSelected', { detail: null }));
    };
  }, [captureRoute]);

  // ─── Panel de posiciones (reutilizado en cada dock) ─────────────────────
  const positionsPanelCard = (
    <div className={cn('flex-1 rounded-md border flex flex-col min-h-0 overflow-hidden', isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70')}>
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div ref={dockPickerRef} className="relative">
            <button
              onClick={() => setShowDockPicker(p => !p)}
              className={cn('p-1 rounded transition-colors', isDark ? 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100')}
              title="Mover panel"
            >
              <GripVertical className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <AnimatePresence>
              {showDockPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className={cn('absolute top-full left-0 mt-1 z-50 rounded-lg border shadow-lg p-2.5', isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200')}
                >
                  <p className={cn('text-[9px] font-semibold uppercase tracking-wider mb-2 px-0.5', isDark ? 'text-zinc-500' : 'text-slate-400')}>Posición del panel</p>
                  <div className="flex gap-1.5">
                    {([
                      { id: 'left' as DockPosition, label: 'Izquierda', svg: <DockLeftSvg />, disabled: false },
                      { id: 'right' as DockPosition, label: 'Derecha', svg: <DockRightSvg />, disabled: false },
                      { id: 'below-sidebar' as DockPosition, label: 'Abajo', svg: <DockBelowSvg />, disabled: !hasEnoughHeight },
                    ]).map(opt => (
                      <button
                        key={opt.id}
                        disabled={opt.disabled}
                        onClick={() => { if (!opt.disabled) { setPositionsDock(opt.id); setShowDockPicker(false); } }}
                        title={opt.disabled ? 'No hay suficiente espacio vertical' : undefined}
                        className={cn(
                          'flex flex-col items-center gap-1.5 px-2.5 py-2 rounded-lg transition-colors border text-[10px] font-medium whitespace-nowrap',
                          opt.disabled
                            ? (isDark ? 'opacity-35 cursor-not-allowed text-zinc-600 border-transparent' : 'opacity-35 cursor-not-allowed text-slate-300 border-transparent')
                            : positionsDock === opt.id
                              ? (isDark ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'bg-blue-50 text-blue-600 border-blue-200')
                              : (isDark ? 'text-zinc-400 border-transparent hover:bg-zinc-800' : 'text-slate-500 border-transparent hover:bg-slate-100'),
                        )}
                      >
                        {opt.svg}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className={cn('text-[9.5px] font-semibold uppercase tracking-wider', isDark ? 'text-zinc-500' : 'text-slate-400')}>
            Posiciones <span className={cn('ml-1 text-[10px]', isDark ? 'text-zinc-600' : 'text-slate-300')}>{positionHistory.length}</span>
          </span>
        </div>
        <span className={cn('w-7 h-7 flex items-center justify-center rounded-lg shrink-0', isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-slate-400')}>
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
        </span>
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden rounded-b-md">
        <div ref={posListRef} onScroll={posCheckScroll} className="absolute inset-0 overflow-y-auto px-3 py-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          <div className="flex flex-col gap-1.5 pb-6">
            {positionHistory.map((item, idx) => (
              <button key={idx} onClick={() => copyText(item.coords, `pos-${idx}`)} className={cn(
                'w-full text-left flex flex-col gap-0.5 px-3 py-2.5 rounded-lg transition-colors border group',
                item.isLast
                  ? (isDark ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50/70 border-blue-400/80')
                  : (isDark ? 'bg-zinc-800/60 border-transparent hover:border-zinc-700' : 'bg-white border-transparent hover:border-slate-200'),
              )}>
                <div className="flex items-center gap-2">
                  <MapPin className={cn('w-2.5 h-2.5 shrink-0', item.isLast ? 'text-blue-500' : (isDark ? 'text-zinc-600' : 'text-slate-300'))} strokeWidth={2} />
                  <span className={cn('text-[10px] font-medium tabular-nums truncate', isDark ? 'text-zinc-400' : 'text-slate-500')}>{item.dateTime}</span>
                  {item.isLast && <span className="text-[10px] font-semibold text-blue-500 shrink-0">Última</span>}
                </div>
                <span className={cn('text-[11px] font-normal line-clamp-2', item.isLast ? 'text-blue-500' : (isDark ? 'text-zinc-200' : 'text-slate-700'))}>{item.address}</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn('text-[10px] font-medium truncate', isDark ? 'text-zinc-500' : 'text-slate-400')}>{item.coords}</span>
                  <Copy className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" strokeWidth={1.5} />
                  {copiedKey === `pos-${idx}` && (
                    <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-sm whitespace-nowrap shrink-0', isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-800 text-white')}>Copiado ✓</span>
                  )}
                </div>
              </button>
            ))}
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

  // ─── Barra de progreso de captura (overlay del mapa) ─────────────────────
  const captureProgressBar = (
    <div className={cn('absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2.5 rounded-md border shadow-sm', isDark ? 'bg-zinc-900/90 border-zinc-700/50' : 'bg-white/90 border-slate-200/70')}>
      {captureStages.map((stage, i) => (
        <Fragment key={stage.id}>
          {i > 0 && <div className={cn('w-6 h-[2px]', stage.state === 'pending' ? (isDark ? 'bg-zinc-700' : 'bg-slate-200') : (isDark ? 'bg-emerald-600' : 'bg-emerald-500'))} />}
          <div className="flex items-center gap-2">
            <div className={cn('w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
              stage.state === 'done' ? (isDark ? 'bg-emerald-600 border-emerald-600' : 'bg-emerald-500 border-emerald-500')
              : stage.state === 'active' ? 'border-emerald-500'
              : (isDark ? 'bg-zinc-800 border-zinc-600' : 'bg-white border-slate-300'),
            )}>
              {stage.state === 'done'   && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              {stage.state === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </div>
            <div className="flex flex-col">
              <span className={cn('text-xs font-semibold leading-tight whitespace-nowrap', stage.state === 'pending' ? (isDark ? 'text-zinc-600' : 'text-slate-300') : (isDark ? 'text-zinc-200' : 'text-slate-700'))}>
                {stage.label}
              </span>
              {stage.timestamp && <span className={cn('text-[10px] leading-tight', isDark ? 'text-zinc-500' : 'text-slate-400')}>{stage.timestamp}</span>}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className={cn('flex flex-col w-full h-full overflow-hidden', isDark ? 'bg-zinc-950' : 'bg-neutral-100')}>

      {/* ─── Layout unificado: sidebar | [posiciones izq] | mapa | [posiciones der] ─── */}
      <div ref={layoutRef} className="flex flex-1 min-h-0 gap-3 p-3">

        {/* ── Sidebar ── */}
        <div className="w-[322px] flex-none flex flex-col min-h-0 gap-3">
          {/* VehicleDetailPanel siempre en la misma posición del árbol para preservar estado interno */}
          <div
            className={cn(
              'overflow-y-auto [&::-webkit-scrollbar]:hidden',
              positionsDock === 'below-sidebar' ? 'grow-0 shrink min-h-0' : 'flex-1',
            )}
            style={{ scrollbarWidth: 'none' }}
          >
            <VehicleDetailPanel vehicle={vehicle} onBack={onBack} isDark={isDark} captureStages={captureStages} positionHistory={positionHistory} showPositions={showPositions} onTogglePositions={() => setShowPositions(p => !p)} gpsSwitchTo={gpsSwitchTo} />
          </div>

          {/* Posiciones — dock abajo del sidebar */}
          <AnimatePresence>
            {positionsDock === 'below-sidebar' && showPositions && (
              <motion.div
                key="positions-below"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="flex-1 min-h-[160px] flex flex-col"
              >
                {positionsPanelCard}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Posiciones — dock izquierda ── */}
        <AnimatePresence>
          {positionsDock === 'left' && showPositions && (
            <motion.div
              key="positions-left"
              initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -12, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-[260px] flex-none flex flex-col min-h-0"
            >
              {positionsPanelCard}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mapa ── */}
        <div className="flex-1 min-w-0 min-h-0">
          <div className={cn('relative w-full h-full rounded-md overflow-hidden border', isDark ? 'border-zinc-800' : 'border-neutral-200')}>
            <VehicleTrackingMap vehicle={vehicle} isDark={isDark} />
            {captureProgressBar}
          </div>
        </div>

        {/* ── Posiciones — dock derecha ── */}
        <AnimatePresence>
          {positionsDock === 'right' && showPositions && (
            <motion.div
              key="positions-right"
              initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 12, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-[260px] flex-none flex flex-col min-h-0"
            >
              {positionsPanelCard}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── GPS modals ── */}
      <AnimatePresence>
        {gpsModal === 'gps-unavailable' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 200 }}
          >
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]"
              onClick={() => setGpsModal('none')}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
              className={cn(
                'relative w-full max-w-sm bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-slate-200/60 overflow-hidden',
                isDark && 'bg-zinc-900 border-zinc-700',
              )}
              role="dialog" aria-modal="true"
            >
              <div className="px-5 pt-5 pb-1 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <WifiOff className="w-5 h-5 text-red-500" strokeWidth={2} />
                </div>
                <h3 className={cn('text-[15px] font-semibold', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                  GPS no disponible
                </h3>
                <p className={cn('text-[12px] mt-2 leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                  El dispositivo GPS se ha retirado o no está reportando.
                  No se está recogiendo información de ubicación.
                </p>
              </div>

              <div className={cn('mx-5 my-3 p-3 rounded-lg border', isDark ? 'bg-zinc-800/60 border-zinc-700' : 'bg-slate-50 border-slate-200')}>
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className={cn('w-3 h-3', isDark ? 'text-zinc-500' : 'text-slate-400')} strokeWidth={2} />
                  <span className={cn('text-[10px] font-semibold uppercase tracking-wider', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                    Última posición conocida
                  </span>
                </div>
                <span className={cn('text-[12px] font-medium', isDark ? 'text-zinc-200' : 'text-slate-700')}>
                  {vehicle.address}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className={cn('text-[10px] font-mono', isDark ? 'text-zinc-500' : 'text-slate-400')}>{vehicle.coords}</span>
                </div>
                <span className={cn('text-[10px] block mt-1', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                  {vehicle.lastSeen}
                </span>
              </div>

              <div className="px-5 pb-5 pt-1 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setGpsModal('none')}
                  className={cn(
                    'px-4 py-2 text-[12px] font-semibold rounded-lg transition-colors',
                    isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gpsModal === 'switch-gps' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 200 }}
          >
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]"
              onClick={() => setGpsModal('none')}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
              className={cn(
                'relative w-full max-w-sm bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-slate-200/60 overflow-hidden',
                isDark && 'bg-zinc-900 border-zinc-700',
              )}
              role="dialog" aria-modal="true"
            >
              <div className="px-5 pt-5 pb-1 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={2} />
                </div>
                <h3 className={cn('text-[15px] font-semibold', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                  GPS principal sin señal
                </h3>
                <p className={cn('text-[12px] mt-2 leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                  El GPS principal ({primaryDevice?.type}) no está reportando.
                  Hay otro dispositivo GPS disponible en esta unidad.
                </p>
              </div>

              <div className={cn('mx-5 my-3 p-3 rounded-lg border', isDark ? 'bg-zinc-800/60 border-zinc-700' : 'bg-amber-50/60 border-amber-200/60')}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', isDark ? 'bg-zinc-700' : 'bg-white')}>
                    <Radio className={cn('w-4 h-4', isDark ? 'text-emerald-400' : 'text-emerald-500')} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={cn('text-[12px] font-semibold capitalize', isDark ? 'text-zinc-100' : 'text-slate-800')}>
                      {devices[availableGpsIdx]?.type}
                    </span>
                    <span className={cn('text-[10px] font-mono', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                      {devices[availableGpsIdx]?.imei}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                    Disponible
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setGpsModal('none')}
                  className={cn(
                    'px-4 py-2 text-[12px] font-semibold rounded-lg transition-colors',
                    isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  Omitir
                </button>
                <button
                  onClick={handleSwitchGps}
                  className="px-4 py-2 text-[12px] font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" strokeWidth={2} />
                  Cambiar a {devices[availableGpsIdx]?.type}
                  <ArrowRight className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
