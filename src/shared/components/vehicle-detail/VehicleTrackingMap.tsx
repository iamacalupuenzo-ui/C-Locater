import React, { useCallback, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';
import { createCustomIcon, getStatusColor, getIconSvg } from '../../lib/mapIcons';
import type { TripEventType, TripEventGroup, TripEventInstance } from './TripPanel';

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_DARK  = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

// ─── Trip route ────────────────────────────────────────────────────────────
type TripRoute = {
  tripId: string;
  status: 'completed' | 'in-progress' | 'cancelled';
  roaming?: boolean;
  origin: [number, number];
  destination: [number, number];
  originLabel: string;
  destLabel: string;
  routeCoords?: [number, number][];
  traveledCoords?: [number, number][];
  remainingCoords?: [number, number][];
} | null;

// ─── SVG icon paths per event type (Lucide 24×24 viewBox, white stroke) ───
const EVENT_SVG: Record<TripEventType, string> = {
  // ArrowUp — exceso de velocidad
  speeding: `
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>`,
  // ChevronsDown — frenado brusco
  hard_braking: `
    <polyline points="7 13 12 18 17 13"/>
    <polyline points="7 6 12 11 17 6"/>`,
  // Zap — aceleración brusca
  harsh_acceleration: `
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" stroke="none"/>`,
  // CornerDownRight — giro brusco
  sharp_turn: `
    <polyline points="15 10 20 15 15 20"/>
    <path d="M4 4v7a4 4 0 0 0 4 4h12"/>`,
};

const EVENT_COLORS: Record<TripEventType, string> = {
  speeding:           '#ef4444',
  hard_braking:       '#f59e0b',
  harsh_acceleration: '#f97316',
  sharp_turn:         '#a855f7',
};

// ─── Marker factory: icono SVG subordinado a los pins A/B ─────────────────
// Base sizes son intencionalmente menores a los 28px de A/B.
// El zoom aplica escala exponencial (pow 1.25) clampeada entre 0.65× y 1.3×.
function createEventMarkerIcon(
  type: TripEventType,
  active: boolean,
  count = 1,
  highlighted = false,
  zoom = 15,
): L.DivIcon {
  const color   = EVENT_COLORS[type];
  const opacity = active ? 1 : 0.28;

  // Base sizes — clearly smaller than A/B (28px) and vehicle pill
  const baseSize = highlighted ? 18 : active ? 14 : 10;

  // Non-linear zoom scale: 1.25^(zoom-15), clamped [0.65, 1.3]
  const scale  = Math.min(1.3, Math.max(0.65, Math.pow(1.25, zoom - 15)));
  const size   = Math.max(8, Math.round(baseSize * scale));
  const half   = size / 2;
  const iconSz = Math.round(size * 0.58);
  const radius = Math.round(size * 0.33);

  // Borde fijo visible + onda expansiva animada (solo cuando está seleccionado)
  const ring = highlighted ? `
    <div style="position:absolute;inset:-2px;border-radius:${radius + 2}px;border:1.5px solid ${color};pointer-events:none;"></div>
    <div class="event-ring-expand" style="position:absolute;inset:-2px;border-radius:${radius + 2}px;border:1.5px solid ${color};pointer-events:none;"></div>
  ` : '';

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;opacity:${opacity};">
      ${ring}
      <div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${color};
           box-shadow:0 1px 4px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
        <svg width="${iconSz}" height="${iconSz}" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${EVENT_SVG[type]}
        </svg>
      </div>
    </div>`;

  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [half, half] });
}

// ─── Route marker (A / B) ──────────────────────────────────────────────────
// Label desplazado al costado para que la línea de ruta no tape el texto.
// A (origen): label arriba-izquierda, dot abajo-derecha.
// B (destino): label arriba-derecha, dot abajo-izquierda.
function createRouteMarkerIcon(type: 'origin' | 'dest'): L.DivIcon {
  const color    = type === 'origin' ? '#3b82f6' : '#10b981';
  const letter   = type === 'origin' ? 'A' : 'B';
  const isOrigin = type === 'origin';

  const W = 48, H = 46;
  const lCX = isOrigin ? 14 : W - 14;   // label circle center x
  const lCY = 14;
  const dX  = isOrigin ? W - 8 : 8;     // dot center x
  const dY  = H - 5;                     // dot center y

  // Start line from circle edge (r=15 clears the 14px radius + 2.5px border)
  const vx = dX - lCX, vy = dY - lCY;
  const vlen = Math.sqrt(vx * vx + vy * vy);
  const ex = +(lCX + 15 * vx / vlen).toFixed(1);
  const ey = +(lCY + 15 * vy / vlen).toFixed(1);

  const html = `
    <div style="position:relative;width:${W}px;height:${H}px;font-family:Inter,ui-sans-serif,sans-serif;">
      <svg style="position:absolute;top:0;left:0;" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <line x1="${ex}" y1="${ey}" x2="${dX}" y2="${dY}"
              stroke="${color}" stroke-width="1.5" stroke-linecap="round" opacity="0.55"/>
      </svg>
      <div style="position:absolute;top:${lCY - 14}px;left:${lCX - 14}px;
                  width:28px;height:28px;border-radius:50%;background:${color};
                  border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);
                  display:flex;align-items:center;justify-content:center;">
        <span style="font-size:12px;font-weight:800;color:white;line-height:1;">${letter}</span>
      </div>
      <div style="position:absolute;top:${dY - 4}px;left:${dX - 4}px;
                  width:8px;height:8px;border-radius:50%;background:${color};
                  border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.25);"></div>
    </div>`;

  return L.divIcon({
    html,
    className: 'route-endpoint-marker',
    iconSize:   [W, H],
    iconAnchor: [dX, dY],
  });
}

// ─── Vehicle on route marker ───────────────────────────────────────────────
// Pill offset upper-right, precise 8px dot at anchor (on the route line).
function createVehicleOnRouteIcon(vehicle: Vehicle, isDark: boolean): L.DivIcon {
  const pillBg     = isDark ? 'rgba(24,24,27,0.96)' : 'rgba(255,255,255,0.96)';
  const pillShadow = '0 0 0 3px rgba(0,82,204,0.2), 0 4px 16px rgba(0,0,0,0.18)';
  const iconBg     = isDark ? '#27272a' : '#f9fafb';
  const iconBorder = isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb';
  const iconColor  = isDark ? '#d4d4d8' : '#374151';
  const nameColor  = isDark ? '#f4f4f5' : '#111827';
  const plateColor = isDark ? '#71717a' : '#6b7280';
  const hasAlarms  = vehicle.alarmCount && vehicle.alarmCount > 0;
  const alarmBg    = isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2';
  const alarmBorder = isDark ? 'rgba(239,68,68,0.4)' : '#FECACA';
  const statusDot  = getStatusColor(vehicle.status);
  const dotBorder  = isDark ? '2px solid #18181b' : '2px solid white';

  const maxChars = Math.max(vehicle.name.length * 7.5, vehicle.plate.length * 6.5);
  const pillW = Math.max(Math.ceil(26 + 7 + maxChars + 24), 90);
  const pillH = 38;

  // Dot lower-left, pill upper-right
  const W  = pillW + 22;
  const H  = pillH + 24;
  const dX = 8;       // dot center x (lower-left)
  const dY = H - 5;   // dot center y
  const pX = 18;      // pill x offset
  const pY = 4;       // pill y offset

  // Connector: from bottom-left of pill area to dot
  const lx1 = pX + 4, ly1 = pY + pillH - 2;

  const html = `
    <div style="position:relative;width:${W}px;height:${H}px;font-family:Inter,ui-sans-serif,sans-serif;">
      <svg style="position:absolute;top:0;left:0;" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <line x1="${lx1}" y1="${ly1}" x2="${dX}" y2="${dY}"
              stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" opacity="0.65"/>
      </svg>
      <div style="position:absolute;top:${pY}px;left:${pX}px;">
        <div style="position:relative;background:${pillBg};backdrop-filter:blur(16px);border-radius:999px;
                    box-shadow:${pillShadow};border:2px solid #0052CC;padding:4px 12px 4px 4px;
                    display:inline-flex;align-items:center;gap:7px;white-space:nowrap;">
          ${hasAlarms ? `
          <div style="position:absolute;top:-6px;right:-6px;z-index:15;display:flex;align-items:center;justify-content:center;width:18px;height:18px;background:${alarmBg};border:1.5px solid ${alarmBorder};border-radius:50%;box-shadow:0 2px 6px rgba(239,68,68,0.25);">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>` : ''}
          <div style="width:26px;height:26px;border-radius:50%;background:${iconBg};display:flex;align-items:center;justify-content:center;color:${iconColor};border:${iconBorder};flex-shrink:0;position:relative;">
            ${getIconSvg(vehicle.type)}
            <div style="position:absolute;top:-1px;right:-1px;width:9px;height:9px;border-radius:50%;background:${statusDot};border:${dotBorder};"></div>
          </div>
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-size:11.5px;font-weight:700;color:${nameColor};line-height:1;">${vehicle.name}</span>
            <span style="font-size:9.5px;font-weight:600;color:${plateColor};line-height:1;">${vehicle.plate}</span>
          </div>
        </div>
      </div>
      <div style="position:absolute;top:${dY - 4}px;left:${dX - 4}px;
                  width:8px;height:8px;border-radius:50%;background:#3b82f6;
                  border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
    </div>`;

  return L.divIcon({
    html,
    className: 'custom-fleet-marker',
    iconSize:  [W, H],
    iconAnchor: [dX, dY],
  });
}

const FLOW_CSS = `
@keyframes route-flow { to { stroke-dashoffset: -24; } }
.route-flow { animation: route-flow 0.65s linear infinite; }
@keyframes event-ring-expand {
  0%   { transform: scale(1);    opacity: 0.65; }
  100% { transform: scale(2.2);  opacity: 0;    }
}
.event-ring-expand { animation: event-ring-expand 1.3s ease-out infinite; }
`;
let flowCssInjected = false;
function injectFlowCss() {
  if (flowCssInjected) return;
  flowCssInjected = true;
  const el = document.createElement('style');
  el.textContent = FLOW_CSS;
  document.head.appendChild(el);
}

// ─── Fallback route (when no real coords available) ────────────────────────
function generateStreetRoute(from: [number, number], to: [number, number]): [number, number][] {
  const latD = to[0] - from[0], lngD = to[1] - from[1];
  const m1: [number, number] = [from[0] + latD * 0.30, from[1] + lngD * 0.10];
  const m2: [number, number] = [from[0] + latD * 0.30, from[1] + lngD * 0.55];
  const m3: [number, number] = [from[0] + latD * 0.70, from[1] + lngD * 0.55];
  const m4: [number, number] = [from[0] + latD * 0.70, from[1] + lngD * 0.90];
  return [from, m1, m2, m3, m4, to];
}

// ─── Proximity clustering — umbral adaptativo por densidad y zoom ─────────
interface EventCluster {
  coords: [number, number];
  count: number;
  instances: TripEventInstance[];
}

// Al hacer zoom el umbral se reduce → clusters se separan naturalmente
function clusterInstances(instances: TripEventInstance[], zoom = 15): EventCluster[] {
  const baseThreshold = instances.length >= 10 ? 0.012 : instances.length >= 5 ? 0.007 : 0.005;
  // 0.6^(zoom-13): a zoom 13 = 1×base | zoom 15 = 0.36× | zoom 17 = 0.13×
  const zoomDecay  = Math.pow(0.6, Math.max(0, zoom - 13));
  const threshold  = baseThreshold * Math.max(0.08, zoomDecay);

  const clusters: EventCluster[] = [];
  const used = new Set<string>();
  for (const inst of instances) {
    if (used.has(inst.id)) continue;
    const nearby = instances.filter(o =>
      !used.has(o.id) &&
      Math.abs(o.coords[0] - inst.coords[0]) < threshold &&
      Math.abs(o.coords[1] - inst.coords[1]) < threshold,
    );
    nearby.forEach(n => used.add(n.id));
    const lat = nearby.reduce((s, n) => s + n.coords[0], 0) / nearby.length;
    const lng = nearby.reduce((s, n) => s + n.coords[1], 0) / nearby.length;
    clusters.push({ coords: [lat, lng] as [number, number], count: nearby.length, instances: nearby });
  }
  return clusters;
}

// ─── Cluster badge icon (count > 3) ───────────────────────────────────────
function createClusterIcon(type: TripEventType, count: number, zoom = 15): L.DivIcon {
  const color  = EVENT_COLORS[type];
  const scale  = Math.min(1.3, Math.max(0.65, Math.pow(1.25, zoom - 15)));
  const size   = Math.max(18, Math.round(22 * scale));
  const half   = size / 2;
  const radius = Math.round(size * 0.33);
  const fSize  = Math.round(size * 0.42);
  const label  = count > 99 ? '99+' : String(count);

  const html = `
    <div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${color};
         box-shadow:0 1px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <span style="font-size:${fSize}px;font-weight:800;color:white;line-height:1;letter-spacing:-0.5px;">
        ${label}
      </span>
    </div>`;

  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [half, half] });
}

// ─── EventMarkers — renderiza dentro del contexto de Leaflet ──────────────
function EventMarkers({
  groups,
  activeEventTypes,
  zoom,
}: {
  groups: TripEventGroup[];
  activeEventTypes: Set<TripEventType>;
  zoom: number;
}) {
  const map = useMap();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { id, coords } = (e as CustomEvent<{ id: string; coords: [number, number] }>).detail;
      setHighlightedId(id);
      map.flyTo(coords, 16, { animate: true, duration: 0.5 });
    };
    // Cambio de tab o cierre del panel → quitar resaltado
    const clearHandler = () => setHighlightedId(null);
    window.addEventListener('highlightEvent', handler);
    window.addEventListener('clearEventHighlight', clearHandler);
    return () => {
      window.removeEventListener('highlightEvent', handler);
      window.removeEventListener('clearEventHighlight', clearHandler);
    };
  }, [map]);

  return (
    <>
      {groups.flatMap(group => {
        const isActive = activeEventTypes.size === 0 || activeEventTypes.has(group.type);
        return clusterInstances(group.instances, zoom).map((cluster, i) => {
          const isCluster    = cluster.count > 3;
          const isHighlighted = !isCluster && cluster.instances.some(inst => inst.id === highlightedId);
          const icon = isCluster
            ? createClusterIcon(group.type, cluster.count, zoom)
            : createEventMarkerIcon(group.type, isActive, cluster.count, isHighlighted, zoom);
          return (
            <Marker
              key={`${group.type}-${i}-${isHighlighted}-${zoom}`}
              position={cluster.coords}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (isCluster) {
                    // Zoom in to split the cluster
                    map.setView(cluster.coords, Math.min(map.getZoom() + 2, 18), { animate: true, duration: 0.5 });
                  } else {
                    map.panTo(cluster.coords, { animate: true, duration: 0.4 });
                    window.dispatchEvent(new CustomEvent('selectEventFromMap', {
                      detail: { type: group.type, id: cluster.instances[0].id, coords: cluster.coords },
                    }));
                  }
                },
              }}
            />
          );
        });
      })}
    </>
  );
}

// ─── Zoom tracker — reporta cambios de zoom al componente padre ───────────
function MapZoomTracker({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoomChange(map.getZoom());
    map.on('zoomend', () => onZoomChange(map.getZoom()));
    return () => { map.off('zoomend', () => onZoomChange(map.getZoom())); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

// ─── Zoom limiter — impide alejarse más de 2 niveles del fit inicial ───────
function ZoomLimiter({ tripId }: { tripId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!tripId) {
      map.setMinZoom(1);
      return;
    }
    // Espera a que fitBounds termine (0.8 s de animación) y fija el minZoom
    const t = setTimeout(() => {
      const z = map.getZoom();
      map.setMinZoom(Math.max(1, z - 2));
    }, 900);
    return () => clearTimeout(t);
  }, [map, tripId]);
  return null;
}

// ─── FitRouteBounds ────────────────────────────────────────────────────────
function FitRouteBounds({ route, vehiclePos }: { route: TripRoute; vehiclePos: [number, number] }) {
  const map = useMap();
  const savedRoute = useRef(route);
  savedRoute.current = route;

  const doFit = useCallback(() => {
    const r = savedRoute.current;
    if (!r) return;
    const pts: [number, number][] =
      r.routeCoords && r.routeCoords.length > 0
        ? r.routeCoords
        : r.traveledCoords && r.traveledCoords.length > 0
          ? [...r.traveledCoords, ...(r.remainingCoords ?? [])]
          : [r.origin, r.destination, ...(r.status === 'in-progress' ? [vehiclePos] : [])];
    const bounds = L.latLngBounds(pts);
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.18), { animate: true, duration: 0.8 });
    }
  }, [map, vehiclePos]);

  useEffect(() => { doFit(); }, [doFit, route, vehiclePos]);
  useEffect(() => {
    window.addEventListener('refitRouteBounds', doFit);
    return () => window.removeEventListener('refitRouteBounds', doFit);
  }, [doFit]);
  return null;
}

// ─── EventLegend — leyenda de tipos de evento sobre el mapa ────────────────
const EVENT_LABELS: Record<TripEventType, string> = {
  speeding:           'Exceso de velocidad',
  hard_braking:       'Frenado brusco',
  harsh_acceleration: 'Aceleración brusca',
  sharp_turn:         'Giro brusco',
};

function EventLegend({ groups }: { groups: TripEventGroup[] }) {
  const types = [...new Set(groups.map(g => g.type))];
  if (types.length === 0) return null;

  return (
    <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.12)] rounded-lg p-2.5 flex flex-col gap-1.5">
      {types.map(type => (
        <div key={type} className="flex items-center gap-2 text-[11px] text-slate-700">
          <span
            className="flex items-center justify-center rounded"
            style={{ width: 18, height: 18, background: EVENT_COLORS[type] }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: EVENT_SVG[type] }} />
          </span>
          <span className="font-medium">{EVENT_LABELS[type]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
interface VehicleTrackingMapProps {
  vehicle: Vehicle;
  isDark?: boolean;
  activeEventTypes?: Set<TripEventType>;
  eventGroups?: TripEventGroup[];
  backgroundRoutes?: [number, number][][];
}

const NO_EVENT_FILTER = new Set<TripEventType>();

export function VehicleTrackingMap({ vehicle, isDark = false, activeEventTypes = NO_EVENT_FILTER, eventGroups, backgroundRoutes }: VehicleTrackingMapProps) {
  const [mounted, setMounted]     = useState(false);
  const [tripRoute, setTripRoute] = useState<TripRoute>(null);
  const [mapZoom, setMapZoom]     = useState(15);
  const handleZoom = useCallback((z: number) => setMapZoom(z), []);

  // Peso de línea inversamente proporcional al zoom: más fino cerca, más grueso lejos
  const lineWeight  = mapZoom >= 16 ? 2 : mapZoom >= 14 ? 3 : 4;
  const ghostWeight = Math.max(1, lineWeight - 1);

  useEffect(() => { setMounted(true); injectFlowCss(); }, []);
  useEffect(() => {
    const h = (e: Event) => setTripRoute((e as CustomEvent<TripRoute>).detail);
    window.addEventListener('tripRouteSelected', h);
    return () => window.removeEventListener('tripRouteSelected', h);
  }, []);

  const vehicleIcon = createCustomIcon(vehicle, true, isDark);

  if (!mounted) {
    return (
      <div className={cn('absolute inset-0 flex items-center justify-center', isDark ? 'bg-zinc-900' : 'bg-neutral-100')}>
        <span className={cn('text-[12px]', isDark ? 'text-zinc-500' : 'text-slate-400')}>Cargando mapa…</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <MapContainer
        center={vehicle.position}
        zoom={15}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
        style={{ background: isDark ? '#18181b' : 'white' }}
      >
        <TileLayer url={isDark ? TILE_DARK : TILE_LIGHT} />
        <MapZoomTracker onZoomChange={handleZoom} />
        <ZoomLimiter tripId={tripRoute?.tripId ?? null} />
        <FitRouteBounds route={tripRoute} vehiclePos={vehicle.position} />

        {/* Rutas fantasma — otros viajes del mismo vehículo */}
        {backgroundRoutes && backgroundRoutes.map((coords, i) => (
          <Polyline
            key={`ghost-${i}`}
            positions={coords}
            pathOptions={{ color: '#94a3b8', weight: ghostWeight, opacity: 0.28, dashArray: '6 8', lineCap: 'round' }}
          />
        ))}

        {/* Vehículo — solo cuando no hay viaje activo */}
        {!tripRoute && (
          <Marker position={vehicle.position} icon={vehicleIcon} />
        )}

        {/* Ruta completada — dash animado fluyendo sobre la ruta */}
        {tripRoute && tripRoute.status !== 'in-progress' && (() => {
          const coords = tripRoute.routeCoords ?? generateStreetRoute(tripRoute.origin, tripRoute.destination);
          return (
            <>
              <Polyline positions={coords} pathOptions={{ color: '#3b82f6', weight: lineWeight, opacity: 0.85, dashArray: '14 10', lineCap: 'round', className: 'route-flow' }} />
              <Marker position={tripRoute.origin}      icon={createRouteMarkerIcon('origin')} />
              <Marker position={tripRoute.destination} icon={createRouteMarkerIcon('dest')}   />
            </>
          );
        })()}

        {/* Ruta en curso */}
        {tripRoute && tripRoute.status === 'in-progress' && (() => {
          const traveled = tripRoute.traveledCoords ?? generateStreetRoute(tripRoute.origin, vehicle.position);
          const vehicleOnRoute = (traveled[traveled.length - 1] ?? vehicle.position) as [number, number];

          if (tripRoute.roaming) {
            // Modo rastreo libre — sin destino definido
            return (
              <>
                <Polyline positions={traveled} pathOptions={{ color: '#3b82f6', weight: lineWeight, opacity: 0.85, dashArray: '14 10', lineCap: 'round', className: 'route-flow' }} />
                <Marker position={vehicleOnRoute} icon={createVehicleOnRouteIcon(vehicle, isDark)} />
                {tripRoute.origin && (
                  <Marker position={tripRoute.origin} icon={createRouteMarkerIcon('origin')} />
                )}
              </>
            );
          }

          const remaining = tripRoute.remainingCoords ?? generateStreetRoute(vehicle.position, tripRoute.destination);
          // Trim last point so the remaining line doesn't render on top of the B dot
          const trimmedRemaining = remaining.length > 1 ? remaining.slice(0, -1) : remaining;
          return (
            <>
              <Polyline positions={traveled}        pathOptions={{ color: '#3b82f6', weight: lineWeight,       opacity: 0.85, dashArray: '14 10', lineCap: 'round', className: 'route-flow' }} />
              <Polyline positions={trimmedRemaining} pathOptions={{ color: '#3b82f6', weight: lineWeight - 0.5, opacity: 0.28, dashArray: '14 10', lineCap: 'round', className: 'route-flow' }} />
              <Marker position={vehicleOnRoute}        icon={createVehicleOnRouteIcon(vehicle, isDark)} />
              <Marker position={tripRoute.origin}      icon={createRouteMarkerIcon('origin')} />
              <Marker position={tripRoute.destination} icon={createRouteMarkerIcon('dest')} zIndexOffset={500} />
            </>
          );
        })()}

        {/* Markers de eventos con iconos SVG + clustering */}
        {eventGroups && eventGroups.length > 0 && (
          <EventMarkers groups={eventGroups} activeEventTypes={activeEventTypes} zoom={mapZoom} />
        )}
      </MapContainer>

      {/* Leyenda de tipos de evento (solo cuando hay eventos visibles) */}
      {eventGroups && eventGroups.length > 0 && (
        <EventLegend groups={eventGroups} />
      )}

    </div>
  );
}
