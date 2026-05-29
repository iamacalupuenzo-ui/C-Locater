import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Clock, MapPin, Bike, Car, Truck, Bus, Settings2, Plus, Minus, Lock, ShieldAlert, Route, MoreHorizontal, Shield, Layers, Share2, Sun, Moon, LocateFixed, PowerOff, Power } from 'lucide-react';

import type { GpsDevice, Vehicle } from '../lib/data';
import { useVehicles } from '../lib/VehicleContext';
import { useTheme } from '../lib/ThemeContext';
import { cn, formatLastSeen } from '../lib/utils';
import { AIAssistantLauncher } from './AIAssistant';
import { getStatusColor, getIconSvg, createCustomIcon as _createCustomIcon } from '../lib/mapIcons';

// ─── GPS layer constants ───────────────────────────────────────────────────

const GPS_COLORS: Record<string, string> = {
  flotas:      '#0052CC',
  basico:      '#34C759',
  contingencia: '#8B5CF6',
  'svr-x':     '#FF9F0A',
};

const GPS_LABELS: Record<string, string> = {
  flotas:      'SVR Plus',
  basico:      'SVR Básico',
  contingencia: 'SVR Contingencia',
  'svr-x':     'SVR X',
};

const GPS_STATUS_LABELS: Record<string, string> = {
  reporting:    'Online',
  'no-signal':  'Sin señal',
  'low-signal': 'Señal baja',
  disconnected: 'Desconectado',
};

// Threshold in degrees (~44 m at equator) to cluster nearby GPS devices
const SPIDERFY_THRESHOLD = 0.0004;

// Radius used when spreading spiderfied markers
const SPIDERFY_RADIUS = 0.0018;

// Zoom below this threshold triggers vehicle clustering (GPS layer also hides)
const VEHICLE_CLUSTER_ZOOM = 14;

// ─── Types ─────────────────────────────────────────────────────────────────

type GpsDeviceWithPos = GpsDevice & { position: [number, number] };

interface GpsCluster {
  key: string;
  center: [number, number];
  devices: Array<{ device: GpsDeviceWithPos; originalIndex: number }>;
}

interface VehicleCluster {
  key: string;
  center: [number, number];
  vehicles: Vehicle[];
}

// ─── Helper functions ──────────────────────────────────────────────────────

function gpsDistance(a: [number, number], b: [number, number]): number {
  const d0 = a[0] - b[0];
  const d1 = a[1] - b[1];
  return Math.sqrt(d0 * d0 + d1 * d1);
}

// Dynamic clustering threshold: grows as user zooms out
function vehicleClusterThreshold(zoom: number): number {
  if (zoom >= VEHICLE_CLUSTER_ZOOM) return 0;
  return 0.4 / Math.pow(2, zoom - 10);
}

function computeVehicleClusters(zoom: number, vehicles: Vehicle[]): VehicleCluster[] {
  const threshold = vehicleClusterThreshold(zoom);

  // No clustering: return each vehicle as its own single-item cluster
  if (threshold === 0) {
    return vehicles.map(v => ({ key: `vc-${v.id}`, center: v.position, vehicles: [v] }));
  }

  const assigned = new Set<string>();
  const clusters: VehicleCluster[] = [];

  for (let i = 0; i < vehicles.length; i++) {
    if (assigned.has(vehicles[i].id)) continue;
    const group = [i];
    assigned.add(vehicles[i].id);
    for (let j = i + 1; j < vehicles.length; j++) {
      if (assigned.has(vehicles[j].id)) continue;
      if (gpsDistance(vehicles[i].position, vehicles[j].position) < threshold) {
        group.push(j);
        assigned.add(vehicles[j].id);
      }
    }
    const items = group.map(idx => vehicles[idx]);
    const center: [number, number] = [
      items.reduce((s, v) => s + v.position[0], 0) / items.length,
      items.reduce((s, v) => s + v.position[1], 0) / items.length,
    ];
    clusters.push({ key: `vc-${vehicles[i].id}`, center, vehicles: items });
  }
  return clusters;
}

function computeClusters(devices: GpsDevice[]): GpsCluster[] {
  const withPos = devices
    .map((device, originalIndex) => ({ device, originalIndex }))
    .filter(({ device }) => device.position != null) as Array<{ device: GpsDeviceWithPos; originalIndex: number }>;

  const assigned = new Set<number>();
  const clusters: GpsCluster[] = [];

  for (let i = 0; i < withPos.length; i++) {
    if (assigned.has(i)) continue;
    const group = [i];
    assigned.add(i);
    for (let j = i + 1; j < withPos.length; j++) {
      if (assigned.has(j)) continue;
      if (gpsDistance(withPos[i].device.position, withPos[j].device.position) < SPIDERFY_THRESHOLD) {
        group.push(j);
        assigned.add(j);
      }
    }
    const items = group.map(idx => withPos[idx]);
    const center: [number, number] = [
      items.reduce((s, x) => s + x.device.position[0], 0) / items.length,
      items.reduce((s, x) => s + x.device.position[1], 0) / items.length,
    ];
    clusters.push({ key: `cluster-${i}`, center, devices: items });
  }

  return clusters;
}

function getSpiderfyPositions(center: [number, number], count: number): [number, number][] {
  if (count === 2) {
    return [
      [center[0], center[1] - SPIDERFY_RADIUS],
      [center[0], center[1] + SPIDERFY_RADIUS],
    ] as [number, number][];
  }
  return Array.from({ length: count }, (_, i) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / count;
    return [
      center[0] + SPIDERFY_RADIUS * Math.cos(angle),
      center[1] + SPIDERFY_RADIUS * Math.sin(angle),
    ] as [number, number];
  });
}

function getGpsTimeDisplay(lastSeen: string): string {
  const parts = lastSeen.split(' ');
  if (parts.length >= 3) {
    const time = parts[1].replace(/:\d\d$/, '');
    return `${time} ${parts[2]}`;
  }
  return lastSeen;
}

// ─── GPS marker icon creators ──────────────────────────────────────────────

// Lucide LocateFixed icon — same as used in VehicleAccordionItem GPS button
const GPS_LOCATE_SVG = (color: string, size = 8) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;

const GPS_STATUS_STYLE_STR: Record<string, { dot: string; text: string; bg: string }> = {
  reporting:    { dot: '#10b981', text: '#10b981', bg: 'rgba(16,185,129,0.10)'  },
  'no-signal':  { dot: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  'low-signal': { dot: '#f97316', text: '#f97316', bg: 'rgba(249,115,22,0.10)' },
  disconnected: { dot: '#94a3b8', text: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
};

// Compact GPS label for low zoom: just pill with name + small dot
function createGpsCompactLabel(device: GpsDeviceWithPos): L.DivIcon {
  const color = GPS_COLORS[device.type] || '#0052CC';
  const label = GPS_LABELS[device.type] || device.type;

  const html = `
    <div style="width:120px;display:flex;flex-direction:column;align-items:center;font-family:Inter,ui-sans-serif,sans-serif;line-height:1;">
      <div style="width:120px;box-sizing:border-box;background:white;border-radius:999px;padding:3px 10px 3px 7px;box-shadow:0 2px 6px rgba(0,0,0,0.12);border:1.5px solid ${color}33;margin-bottom:3px;display:flex;align-items:center;gap:4px;">
        ${GPS_LOCATE_SVG(color, 8)}
        <span style="font-size:9px;font-weight:700;color:${color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${label}</span>
      </div>
      <div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);flex-shrink:0;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'gps-device-marker',
    iconSize: [120, 29],
    iconAnchor: [60, 22],
  });
}

// Unified GPS marker: icon + name + time + status tag (used for all GPS markers)
function createGpsMarkerIcon(device: GpsDeviceWithPos, isSelected = false): L.DivIcon {
  const color       = GPS_COLORS[device.type]  || '#0052CC';
  const label       = GPS_LABELS[device.type]  || device.type;
  const statusLabel = GPS_STATUS_LABELS[device.reportStatus] || device.reportStatus;
  const sc          = GPS_STATUS_STYLE_STR[device.reportStatus] ?? GPS_STATUS_STYLE_STR.disconnected;
  const timeDisplay = getGpsTimeDisplay(device.lastSeen);

  const pingRing = isSelected
    ? `<div class="gps-ping-ring" style="position:absolute;width:22px;height:22px;border-radius:50%;background:${color};top:-4px;left:-4px;z-index:0;"></div>`
    : '';

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;font-family:Inter,ui-sans-serif,sans-serif;line-height:1;">
      <div style="width:152px;box-sizing:border-box;background:white;border-radius:10px;padding:7px 10px;border:1.5px solid ${color}33;box-shadow:0 4px 14px rgba(0,0,0,0.12);margin-bottom:5px;">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">
          ${GPS_LOCATE_SVG(color, 11)}
          <span style="font-size:10.5px;font-weight:700;color:${color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${label}</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;">
          <span style="font-size:8.5px;font-weight:500;color:#6b7280;white-space:nowrap;">${timeDisplay}</span>
          <div style="display:inline-flex;align-items:center;gap:2px;padding:1px 6px;border-radius:999px;background:${sc.bg};flex-shrink:0;">
            <div style="width:4px;height:4px;border-radius:50%;background:${sc.dot};flex-shrink:0;"></div>
            <span style="font-size:7.5px;font-weight:600;color:${sc.text};white-space:nowrap;">${statusLabel}</span>
          </div>
        </div>
      </div>
      <div style="width:1px;height:8px;background:${color};opacity:0.5;"></div>
      <div style="position:relative;width:14px;height:14px;">
        ${pingRing}
        <div style="position:relative;width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.22);display:flex;align-items:center;justify-content:center;z-index:1;">
          ${GPS_LOCATE_SVG('white', 7)}
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'gps-device-marker',
    iconSize: [152, 70],
    iconAnchor: [76, 60],
  });
}

function createGpsExpandedIcon(device: GpsDeviceWithPos): L.DivIcon {
  const color       = GPS_COLORS[device.type]  || '#0052CC';
  const label       = GPS_LABELS[device.type]  || device.type;
  const statusLabel = GPS_STATUS_LABELS[device.reportStatus] || device.reportStatus;
  const sc          = GPS_STATUS_STYLE_STR[device.reportStatus] ?? GPS_STATUS_STYLE_STR.disconnected;
  const coords      = `${device.position[0].toFixed(6)}, ${device.position[1].toFixed(6)}`;
  const lastSeen    = formatLastSeen(device.lastSeen);

  const cardW  = 204;
  const stemH  = 10;
  const cardH  = 98;
  const totalH = cardH + 2 + stemH + 6;
  const anchorY = cardH + 2 + stemH + 3;

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;font-family:Inter,ui-sans-serif,system-ui,sans-serif;line-height:1;">
      <div class="gps-card-anim" style="position:relative;width:${cardW}px;background:white;border-radius:13px;box-shadow:0 8px 24px rgba(0,0,0,0.13),0 2px 6px rgba(0,0,0,0.07);border:1.5px solid ${color}28;padding:10px;box-sizing:border-box;">
        <button onclick="event.stopPropagation();if(window._closeGpsCard)window._closeGpsCard();" style="position:absolute;top:8px;right:8px;width:20px;height:20px;border-radius:50%;background:#f3f4f6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:12px;padding:0;line-height:1;z-index:10;font-family:inherit;">×</button>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-right:18px;">
          <div style="width:28px;height:28px;border-radius:8px;background:${color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${GPS_LOCATE_SVG(color, 14)}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:700;color:${color};line-height:1;">${label}</div>
            <div style="margin-top:4px;display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:999px;background:${sc.bg};">
              <div style="width:5px;height:5px;border-radius:50%;background:${sc.dot};flex-shrink:0;"></div>
              <span style="font-size:9px;font-weight:600;color:${sc.text};line-height:1;">${statusLabel}</span>
            </div>
          </div>
        </div>
        <div style="height:1px;background:${color}18;margin-bottom:7px;"></div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style="font-size:10px;font-weight:600;color:#374151;font-family:ui-monospace,monospace;">${coords}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style="font-size:10px;font-weight:600;color:#374151;">${lastSeen}</span>
        </div>
      </div>
      <div style="width:1px;height:${stemH}px;background:${color};opacity:0.55;margin-top:2px;"></div>
      <div style="position:relative;width:6px;height:6px;">
        <div class="gps-ping-ring" style="position:absolute;width:14px;height:14px;border-radius:50%;background:${color};top:-4px;left:-4px;z-index:0;"></div>
        <div style="position:relative;width:6px;height:6px;background:${color};border-radius:50%;z-index:1;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'gps-device-marker',
    iconSize: [cardW, totalH],
    iconAnchor: [cardW / 2, anchorY],
  });
}



function createClusterIcon(count: number): L.DivIcon {
  const html = `
    <div style="width:36px;height:36px;border-radius:50%;background:#F59E0B;border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.22),0 0 0 4px rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:Inter,ui-sans-serif,sans-serif;">
      <span style="font-size:14px;font-weight:800;color:white;line-height:1;">${count}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'gps-cluster-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createVehicleClusterIcon(count: number, hasAlarms: boolean): L.DivIcon {
  const bg = hasAlarms ? '#EF4444' : '#0052CC';
  const shadow = hasAlarms
    ? '0 4px 16px rgba(239,68,68,0.35),0 0 0 5px rgba(239,68,68,0.15)'
    : '0 4px 16px rgba(0,82,204,0.35),0 0 0 5px rgba(0,82,204,0.15)';
  const html = `
    <div style="width:46px;height:46px;border-radius:50%;background:${bg};border:3px solid white;box-shadow:${shadow};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-family:Inter,ui-sans-serif,sans-serif;gap:1px;${hasAlarms ? 'animation:cluster-alarm-pulse 2s ease-in-out infinite;' : ''}">
      <span style="font-size:17px;font-weight:800;color:white;line-height:1;">${count}</span>
      <span style="font-size:7px;font-weight:600;color:rgba(255,255,255,0.8);line-height:1;letter-spacing:0.04em;">veh.</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'vehicle-cluster-marker',
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

// ─── Vehicle marker icon creators ─────────────────────────────────────────

function MapInstanceCapture({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

function BoundsUpdater({ points }: { points?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points ? points.length > 0 : false]);
  return null;
}

function GpsBoundsUpdater({ vehicleId, positions, profile = 'c-go', monitorW = 306 }: { vehicleId: string | null; positions: [number, number][]; profile?: 'c-go' | 'c-loc'; monitorW?: number }) {
  const map = useMap();
  const prevVehicleId = useRef<string | null>(null);

  useEffect(() => {
    if (vehicleId && vehicleId !== prevVehicleId.current && positions.length >= 2) {
      prevVehicleId.current = vehicleId;
      const bounds = L.latLngBounds(positions);
      if (bounds.isValid()) {
        if (profile === 'c-loc') {
          // GpsPopover (~300px) aparece a la derecha del FloatingMonitor — dejar espacio visible a la derecha
          const leftPad = monitorW + 16 + 300 + 24; // monitor + gap + popover + margen
          map.fitBounds(bounds, { paddingTopLeft: [leftPad, 80], paddingBottomRight: [80, 80], maxZoom: 16 });
        } else {
          map.fitBounds(bounds, { padding: [110, 110], maxZoom: 16 });
        }
      }
    }
    if (!vehicleId) {
      prevVehicleId.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  return null;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':  return 'Activo';
    case 'stopped': return 'Detenido';
    case 'offline': return 'Sin señal';
    default:        return '';
  }
};

// Pill has border:2px on all sides → outer height = 2+4+26+4+2 = 38px (not 34)
const COLLAPSED_ANCHOR_Y = 58; // pill_outer(38) + gap(2) + stem(12) + dot(6)
// wrapper defined inside component render — uses isDark from closure

// ─── Trip route helpers ─────────────────────────────────────────────────────

type TripRoute = {
  tripId: string;
  origin: [number, number];
  destination: [number, number];
  originLabel: string;
  destLabel: string;
} | null;

// Genera waypoints estilo Manhattan entre dos puntos para simular calles
function generateStreetRoute(from: [number, number], to: [number, number]): [number, number][] {
  const latD = to[0] - from[0];
  const lngD = to[1] - from[1];
  const m1: [number, number] = [from[0] + latD * 0.30, from[1] + lngD * 0.10];
  const m2: [number, number] = [from[0] + latD * 0.30, from[1] + lngD * 0.55];
  const m3: [number, number] = [from[0] + latD * 0.70, from[1] + lngD * 0.55];
  const m4: [number, number] = [from[0] + latD * 0.70, from[1] + lngD * 0.90];
  return [from, m1, m2, m3, m4, to];
}

function createRouteMarkerIcon(type: 'origin' | 'dest'): L.DivIcon {
  const color    = type === 'origin' ? '#3b82f6' : '#10b981';
  const letter   = type === 'origin' ? 'A' : 'B';
  const isOrigin = type === 'origin';
  const W = 48, H = 46;
  const lCX = isOrigin ? 14 : W - 14;
  const lCY = 14;
  const dX  = isOrigin ? W - 8 : 8;
  const dY  = H - 5;
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
                  border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
    </div>`;
  return L.divIcon({ html, className: 'route-endpoint-marker', iconSize: [W, H], iconAnchor: [dX, dY] });
}

// ─── Main FleetMap component ────────────────────────────────────────────────

export function FleetMap({
  isDrawingMode,
  drawingPoints,
  onMapClick,
  groupRoutes,
  selectedRouteId,
  monitorSide = 'left',
  monitorW = 306,
  profile = 'c-go',
}: {
  isDrawingMode?: boolean;
  drawingPoints?: [number, number][];
  onMapClick?: (lat: number, lng: number) => void;
  groupRoutes?: any[];
  selectedRouteId?: string | null;
  monitorSide?: 'left' | 'right';
  monitorW?: number;
  profile?: 'c-go' | 'c-loc';
} = {}) {
  const [mounted, setMounted] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [cardVehicleId, setCardVehicleId] = useState<string | null>(null);
  const [mapMoving, setMapMoving] = useState(false);
  const [selectedGpsImei, setSelectedGpsImei] = useState<string | null>(null);  // ping highlight
  const [expandedGpsImei, setExpandedGpsImei] = useState<string | null>(null);  // card open
  const [spiderfiedClusterKey, setSpiderfiedClusterKey] = useState<string | null>(null);
  // GPS layer only shows when user explicitly clicks "Ver dispositivos GPS"
  const [gpsLayerVehicleId, setGpsLayerVehicleId] = useState<string | null>(null);
  const gpsLayerVehicleIdRef = useRef<string | null>(null);
  gpsLayerVehicleIdRef.current = gpsLayerVehicleId;
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const { isDark } = useTheme();
  // mapDark: controla solo los tiles del mapa — independiente del tema global
  const [mapDark, setMapDark] = useState(false);
  // Sincronizar cuando cambia el tema global
  React.useEffect(() => { setMapDark(isDark); }, [isDark]);
  const vehicles = useVehicles();

  const [tripRoute, setTripRoute] = useState<TripRoute>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<TripRoute>).detail;
      setTripRoute(detail);
      if (detail) {
        const map = mapInstanceRef.current;
        if (map) {
          const bounds = L.latLngBounds([detail.origin, detail.destination]);
          map.fitBounds(bounds.pad(0.35), { animate: true, duration: 0.8 });
        }
      }
    };
    window.addEventListener('tripRouteSelected', handler);
    return () => window.removeEventListener('tripRouteSelected', handler);
  }, []);

  const activeVehicleId = highlightedId;
  const highlightedVehicle = cardVehicleId ? (vehicles.find(v => v.id === cardVehicleId) ?? null) : null;

  // GPS layer vehicle — only set via explicit user action, not by vehicle selection
  const gpsLayerVehicle = gpsLayerVehicleId ? (vehicles.find(v => v.id === gpsLayerVehicleId) ?? null) : null;

  // GPS devices with positions for the GPS layer vehicle
  const activeGpsDevices = (gpsLayerVehicle?.gpsDevices ?? []).filter(
    (d): d is GpsDeviceWithPos => d.position != null
  );

  // All GPS positions as array for trail polyline + bounds
  const gpsPositions: [number, number][] = activeGpsDevices.map(d => d.position);

  // Cluster computation: groups nearby GPS devices
  const gpsClusters: GpsCluster[] = activeGpsDevices.length >= 2
    ? computeClusters(gpsLayerVehicle?.gpsDevices ?? [])
    : [];

  // Vehicle cluster computation: groups nearby vehicles based on zoom
  const vehicleClusters = computeVehicleClusters(mapZoom, vehicles);
  const vehiclesAreClustered = vehicleClusters.some(c => c.vehicles.length > 1);

  // GPS layer is only visible when explicitly requested via "Ver dispositivos GPS"
  const showGpsLayer = !vehiclesAreClustered && gpsLayerVehicle && activeGpsDevices.length >= 2;

  useEffect(() => {
    setMounted(true);

    // Inject GPS animation CSS once
    if (!document.getElementById('clocater-gps-styles')) {
      const style = document.createElement('style');
      style.id = 'clocater-gps-styles';
      style.textContent = `
        @keyframes gps-card-pop {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gps-ping {
          0%   { transform: scale(0.8); opacity: 0.75; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes cluster-alarm-pulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(239,68,68,0.35), 0 0 0 5px rgba(239,68,68,0.15); }
          50%      { box-shadow: 0 4px 24px rgba(239,68,68,0.55), 0 0 0 8px rgba(239,68,68,0.25); }
        }
        @keyframes route-flow { to { stroke-dashoffset: -24; } }
        .gps-card-anim { animation: gps-card-pop 0.18s ease-out; }
        .gps-ping-ring { animation: gps-ping 1.5s cubic-bezier(0,0,0.2,1) infinite !important; }
        .route-flow    { animation: route-flow 0.65s linear infinite; }
        .gps-device-marker, .gps-cluster-marker, .gps-spiderfy-marker,
        .vehicle-cluster-marker {
          background: transparent !important;
          border: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    const handleVehicleSelect = (e: Event) => {
      const { id, source } = (e as CustomEvent<{ id: string | null; source?: string }>).detail;
      if (source === 'monitor') {
        setHighlightedId(id);
        setSpiderfiedClusterKey(null);
      } else if (source === 'marker') {
        setHighlightedId(id);
        setCardVehicleId(id);
        if (!id) { setSelectedGpsImei(null); setExpandedGpsImei(null); }
        setSpiderfiedClusterKey(null);
      }
    };

    const handleGpsSelect = (e: Event) => {
      const { imei } = (e as CustomEvent<{ vehicleId: string; imei: string | null }>).detail;
      setSelectedGpsImei(imei);
      // sidebar selection shows ping only, not the on-map card
    };

    const handleGpsLayerToggle = (e: Event) => {
      const { vehicleId } = (e as CustomEvent<{ vehicleId: string | null }>).detail;
      setGpsLayerVehicleId(vehicleId);
      if (!vehicleId) { setSelectedGpsImei(null); setExpandedGpsImei(null); setSpiderfiedClusterKey(null); }
    };

    window.addEventListener('vehicleSelected', handleVehicleSelect);
    window.addEventListener('gpsDeviceSelected', handleGpsSelect);
    window.addEventListener('vehicleGpsLayerToggle', handleGpsLayerToggle);

    (window as any)._closeFleetMarker = () => {
      setHighlightedId(null);
      setCardVehicleId(null);
      setSelectedGpsImei(null);
      setExpandedGpsImei(null);
      setSpiderfiedClusterKey(null);
      setGpsLayerVehicleId(null);
      window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: null, source: 'marker' } }));
    };

    (window as any)._closeGpsCard = () => {
      setExpandedGpsImei(null);
    };

    return () => {
      window.removeEventListener('vehicleSelected', handleVehicleSelect);
      window.removeEventListener('gpsDeviceSelected', handleGpsSelect);
      window.removeEventListener('vehicleGpsLayerToggle', handleGpsLayerToggle);
      delete (window as any)._closeFleetMarker;
      delete (window as any)._closeGpsCard;
    };
  }, []);

  // Hide vehicle card while map is moving
  useEffect(() => {
    const onStart = () => setMapMoving(true);
    const onEnd   = () => setMapMoving(false);
    window.addEventListener('mapMoveStart', onStart);
    window.addEventListener('mapMoveEnd',   onEnd);
    return () => {
      window.removeEventListener('mapMoveStart', onStart);
      window.removeEventListener('mapMoveEnd',   onEnd);
    };
  }, []);

  // Reset spiderfy and GPS card when GPS layer vehicle changes
  useEffect(() => {
    setSpiderfiedClusterKey(null);
    setExpandedGpsImei(null);
  }, [gpsLayerVehicleId]);

  // Clear vehicle selection and GPS states when vehicles cluster together
  useEffect(() => {
    if (vehiclesAreClustered) {
      setHighlightedId(null);
      setSelectedGpsImei(null);
      setExpandedGpsImei(null);
      setSpiderfiedClusterKey(null);
      setGpsLayerVehicleId(null);
      // Si el GPS layer estaba activo fue él quien provocó el zoom-out → no colapsar el monitor
      if (!gpsLayerVehicleIdRef.current) {
        window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: null, source: 'map' } }));
      }
    }
  }, [vehiclesAreClustered]);

  if (!mounted) return null;

  const selectedRoute = groupRoutes?.find(r => r.id === selectedRouteId);

  const handleDeselect = () => {
    setHighlightedId(null);
    setCardVehicleId(null);
    setSelectedGpsImei(null);
    setExpandedGpsImei(null);
    setSpiderfiedClusterKey(null);
    setGpsLayerVehicleId(null);
    window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: null, source: 'map' } }));
  };

  // Cierra solo la card inferior sin colapsar el acordeón del monitor
  const handleCardClose = () => {
    setHighlightedId(null);
    setCardVehicleId(null);
    setSelectedGpsImei(null);
    setExpandedGpsImei(null);
    setSpiderfiedClusterKey(null);
    setGpsLayerVehicleId(null);
    window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: null, source: 'marker' } }));
  };

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[-12.0464, -77.0428]}
        zoom={15}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: mapDark ? '#18181b' : 'white', cursor: isDrawingMode ? 'crosshair' : 'grab' }}
      >
        <MapInstanceCapture mapRef={mapInstanceRef} />
        <BoundsUpdater points={drawingPoints?.length ? drawingPoints : selectedRoute?.coordinates} />
        <GpsBoundsUpdater vehicleId={activeGpsDevices.length >= 2 ? gpsLayerVehicleId : null} positions={gpsPositions} profile={profile} monitorW={monitorW} />
        <MapEvents
          onMapClick={onMapClick}
          isDrawingMode={isDrawingMode}
          onDeselect={handleDeselect}
          onZoomChange={(z) => { setSpiderfiedClusterKey(null); setMapZoom(z); }}
        />
        <TileLayer
          key={mapDark ? 'dark' : 'light'}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url={mapDark
            ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          }
        />

        {/* Selected Route rendering */}
        {!isDrawingMode && selectedRoute && selectedRoute.coordinates && selectedRoute.coordinates.length > 0 && (
          <>
            <Polyline positions={selectedRoute.coordinates} color="#0052CC" weight={6} opacity={0.8} />
            {selectedRoute.coordinates.map((pt: [number, number], i: number) => (
              <Marker key={`selected-${i}`} position={pt} icon={L.divIcon({
                className: 'custom-dot',
                html: `<div class="w-3 h-3 bg-[#0052CC] border-2 border-white rounded-full shadow-md"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })} />
            ))}
          </>
        )}

        {/* Trip route overlay */}
        {tripRoute && (
          <>
            <Polyline
              positions={generateStreetRoute(tripRoute.origin, tripRoute.destination)}
              pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.85, dashArray: '14 10', lineCap: 'round', className: 'route-flow' }}
            />
            <Marker position={tripRoute.origin}      icon={createRouteMarkerIcon('origin')} />
            <Marker position={tripRoute.destination} icon={createRouteMarkerIcon('dest')}   />
          </>
        )}

        {isDrawingMode && drawingPoints && drawingPoints.length > 0 && (
          <>
            <Polyline positions={drawingPoints} color="#0052CC" weight={4} dashArray="8, 8" />
            {drawingPoints.map((pt, i) => (
              <Marker key={i} position={pt} icon={L.divIcon({
                className: 'custom-dot',
                html: `<div class="w-3 h-3 bg-white border-2 border-[#0052CC] rounded-full shadow-md"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })} />
            ))}
          </>
        )}

        {/* ── GPS multi-position layer (hidden when vehicles are clustered) ── */}
        {!isDrawingMode && showGpsLayer && (
          <>
            {/* Trail polyline connecting all GPS real positions */}
            <Polyline
              positions={gpsPositions}
              color="#0052CC"
              weight={2.5}
              opacity={0.5}
              dashArray="7,5"
            />

            {gpsClusters.map(cluster => {
              // Single GPS in this cluster: show at its real position
              const gpsIcon = (device: GpsDeviceWithPos, isSelected: boolean) =>
                mapZoom >= 14
                  ? createGpsMarkerIcon(device, isSelected)
                  : createGpsCompactLabel(device);

              if (cluster.devices.length === 1) {
                const { device } = cluster.devices[0];
                const isGpsExpanded = expandedGpsImei === device.imei;
                const isGpsSelected = selectedGpsImei === device.imei;
                return (
                  <Marker
                    key={`gps-single-${device.imei}`}
                    position={device.position}
                    icon={isGpsExpanded ? createGpsExpandedIcon(device) : gpsIcon(device, isGpsSelected)}
                    zIndexOffset={isGpsExpanded ? 1300 : isGpsSelected ? 1200 : 1100}
                    eventHandlers={{
                      click: () => {
                        (window as any)._markerJustClicked = true;
                        setTimeout(() => { (window as any)._markerJustClicked = false; }, 50);
                        setExpandedGpsImei(isGpsExpanded ? null : device.imei);
                        setSelectedGpsImei(device.imei);
                      }
                    }}
                  />
                );
              }

              // Multiple GPS very close: show badge until clicked
              const isSpiderfied = spiderfiedClusterKey === cluster.key;
              if (!isSpiderfied) {
                return (
                  <Marker
                    key={`gps-cluster-${cluster.key}`}
                    position={cluster.center}
                    icon={createClusterIcon(cluster.devices.length)}
                    zIndexOffset={1100}
                    eventHandlers={{
                      click: () => {
                        (window as any)._markerJustClicked = true;
                        setTimeout(() => { (window as any)._markerJustClicked = false; }, 50);
                        setSpiderfiedClusterKey(cluster.key);
                      }
                    }}
                  />
                );
              }

              // Spiderfied: one direct line per GPS from vehicle dot to spread position
              const spreadPositions = getSpiderfyPositions(cluster.center, cluster.devices.length);
              return (
                <React.Fragment key={`spider-${cluster.key}`}>
                  {cluster.devices.map(({ device }, i) => (
                    <React.Fragment key={`spider-device-${device.imei}`}>
                      <Polyline
                        positions={[gpsLayerVehicle!.position, spreadPositions[i]]}
                        color="#6366F1"
                        weight={2.5}
                        opacity={0.6}
                        dashArray="7,5"
                      />
                      <Marker
                        position={spreadPositions[i]}
                        icon={expandedGpsImei === device.imei
                          ? createGpsExpandedIcon(device)
                          : gpsIcon(device, selectedGpsImei === device.imei)}
                        zIndexOffset={expandedGpsImei === device.imei ? 1400 : selectedGpsImei === device.imei ? 1300 : 1200}
                        eventHandlers={{
                          click: () => {
                            (window as any)._markerJustClicked = true;
                            setTimeout(() => { (window as any)._markerJustClicked = false; }, 50);
                            setExpandedGpsImei(expandedGpsImei === device.imei ? null : device.imei);
                            setSelectedGpsImei(device.imei);
                          }
                        }}
                      />
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            })}
          </>
        )}

        {/* ── Fleet vehicle markers (or cluster badges when zoomed out) ── */}
        {!isDrawingMode && vehicleClusters.map((cluster) => {
          // Single vehicle in this cluster: render as normal marker
          if (cluster.vehicles.length === 1) {
            const vehicle = cluster.vehicles[0];
            const vGpsCount = (vehicle.gpsDevices ?? []).filter(d => d.position != null).length;
            const isHighlighted = highlightedId === vehicle.id;
            const hasMultiGps = isHighlighted && vGpsCount >= 2;
            const isGpsActive = !!gpsLayerVehicleId;
            const isGpsVehicle = gpsLayerVehicleId === vehicle.id;
            const markerOpacity = isGpsActive && !isGpsVehicle ? 0.3 : 1;
            return (
              <Marker
                key={vehicle.id}
                position={vehicle.position}
                icon={_createCustomIcon(vehicle, isHighlighted || hasMultiGps, mapDark)}
                opacity={markerOpacity}
                zIndexOffset={isHighlighted ? 1000 : 0}
                eventHandlers={{
                  click: () => {
                    (window as any)._markerJustClicked = true;
                    setTimeout(() => { (window as any)._markerJustClicked = false; }, 50);
                    const newId = isHighlighted ? null : vehicle.id;
                    setHighlightedId(newId);
                    setCardVehicleId(newId);
                    if (!newId) {
                      setSelectedGpsImei(null);
                      setExpandedGpsImei(null);
                      setSpiderfiedClusterKey(null);
                    }
                    window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: newId, source: 'marker' } }));
                  }
                }}
              />
            );
          }
          // Multiple vehicles grouped: render cluster badge; click zooms in
          return (
            <Marker
              key={cluster.key}
              position={cluster.center}
              icon={createVehicleClusterIcon(cluster.vehicles.length, cluster.vehicles.some(v => (v.alarmCount ?? 0) > 0))}
              opacity={gpsLayerVehicleId ? 0.3 : 1}
              zIndexOffset={500}
              eventHandlers={{
                click: () => {
                  (window as any)._markerJustClicked = true;
                  setTimeout(() => { (window as any)._markerJustClicked = false; }, 50);
                  window.dispatchEvent(new CustomEvent('fitBoundsToVehicleCluster', {
                    detail: { positions: cluster.vehicles.map(v => v.position) }
                  }));
                }
              }}
            />
          );
        })}
      </MapContainer>

      {/* ── Zoom controls — derecha ── */}
      <div className="absolute bottom-4 right-[10px] z-[1000] flex flex-col items-center gap-1.5">

        {/* Toggle sol/luna — solo cambia los tiles del mapa */}
        <button
          onClick={() => setMapDark(v => !v)}
          title={mapDark ? 'Mapa claro' : 'Mapa oscuro'}
          className={cn(
            'w-[30px] h-[30px] rounded-md flex items-center justify-center backdrop-blur-sm transition-all border shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
            mapDark
              ? 'bg-zinc-800/95 text-amber-400 border-zinc-700 hover:bg-zinc-700'
              : 'bg-white/95 text-slate-500 border-slate-200/80 hover:bg-white hover:text-slate-800'
          )}
        >
          {mapDark ? <Sun className="w-3.5 h-3.5" strokeWidth={2} /> : <Moon className="w-3.5 h-3.5" strokeWidth={2} />}
        </button>

        {/* Separador */}
        <div className={cn('w-5 h-px', isDark ? 'bg-zinc-700' : 'bg-slate-200')} />

        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className={cn('w-[30px] h-[30px] rounded-t-md flex items-center justify-center backdrop-blur-sm transition-colors border shadow-[0_2px_8px_rgba(0,0,0,0.15)]', isDark ? 'bg-zinc-800/95 text-zinc-300 hover:bg-zinc-700 hover:text-white border-zinc-700' : 'bg-white/95 text-slate-600 hover:bg-white hover:text-slate-900 border-slate-200/80')}
          title="Acercar"
          style={{ borderBottom: isDark ? '0.5px solid #374151' : '0.5px solid #e2e8f0' }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className={cn('w-[30px] h-[30px] rounded-b-md flex items-center justify-center backdrop-blur-sm transition-colors border shadow-[0_2px_8px_rgba(0,0,0,0.15)]', isDark ? 'bg-zinc-800/95 text-zinc-300 hover:bg-zinc-700 hover:text-white border-zinc-700' : 'bg-white/95 text-slate-600 hover:bg-white hover:text-slate-900 border-slate-200/80')}
          title="Alejar"
          style={{ marginTop: '-0.5px' }}
        >
          <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Orbe IA — centro inferior ── */}
      <AIAssistantLauncher />

      {/* Vehicle info card */}
      <AnimatePresence>
        {highlightedVehicle && (() => {
          const v = highlightedVehicle;
          const statusColor = v.status === 'active' ? '#34C759' : v.status === 'stopped' ? '#FF9500' : '#94a3b8';
          const statusLabel = v.status === 'active' ? 'Activo' : v.status === 'stopped' ? 'Detenido' : 'Sin señal';
          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: mapMoving ? 0 : 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: mapMoving ? 0.15 : 0.22, ease: [0.23, 1, 0.32, 1] }}
              id="map-vehicle-card"
              className={cn('absolute bottom-4 z-[1000] w-[306px] backdrop-blur-2xl rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.1)]', isDark ? 'bg-zinc-900/97 border-zinc-700/80' : 'bg-white/97 border-slate-200/70')}
              style={{ left: 16, pointerEvents: mapMoving ? 'none' : undefined }}
            >
              {/* Header */}
              {(() => {
                const ignition = v.gpsDevices?.[0]?.ignition ?? null;
                const ignitionOn = ignition === 'on';
                return (
                  <div className="flex items-start gap-2 px-3.5 pt-3 pb-2.5">
                    <div className="flex-1 min-w-0">
                      {/* Fila 1: placa + estado GPS + encendido */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn('text-[15px] font-bold leading-none tracking-tight', isDark ? 'text-zinc-50' : 'text-gray-900')}>{v.plate.replace(/-/g, '')}</span>
                        <div className="inline-flex items-center gap-1 rounded-full px-2 py-[3px]" style={{ background: `${statusColor}18` }}>
                          <LocateFixed className="w-2.5 h-2.5 shrink-0" style={{ color: statusColor }} strokeWidth={2} />
                          <span className="text-[9.5px] font-semibold leading-none" style={{ color: statusColor }}>{statusLabel}</span>
                        </div>
                        {ignition !== null && (() => {
                          const ignColor = ignitionOn ? '#34C759' : '#94a3b8';
                          return (
                            <div className="inline-flex items-center gap-1 rounded-full px-2 py-[3px]" style={{ background: `${ignColor}18` }}>
                              {ignitionOn
                                ? <Power    className="w-2.5 h-2.5 shrink-0" style={{ color: ignColor }} strokeWidth={2} />
                                : <PowerOff className="w-2.5 h-2.5 shrink-0" style={{ color: ignColor }} strokeWidth={2} />
                              }
                              <span className="text-[9.5px] font-semibold leading-none" style={{ color: ignColor }}>{ignitionOn ? 'Encendido' : 'Apagado'}</span>
                            </div>
                          );
                        })()}
                      </div>
                      {/* Fila 2: fecha y hora */}
                      <div className="flex items-center gap-1.5 mt-3">
                        <Clock className={cn('w-3 h-3 shrink-0', isDark ? 'text-zinc-600' : 'text-slate-300')} strokeWidth={1.75} />
                        <span className={cn('text-[10.5px] font-medium', isDark ? 'text-zinc-500' : 'text-slate-400')}>{formatLastSeen(v.lastSeen)}</span>
                      </div>
                      {/* Fila 3: ubicación */}
                      <div className="flex items-start gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0 mt-[1px]" strokeWidth={1.75} />
                        <span className={cn('text-[10.5px] font-medium leading-snug line-clamp-2', isDark ? 'text-zinc-400' : 'text-slate-500')}>{v.address}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCardClose()}
                      className={cn('w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0', isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })()}


              {/* Acciones rápidas */}
              <div className="relative mx-3.5 mt-0.5 mb-3">
                {isMoreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[1001]" onClick={() => setIsMoreMenuOpen(false)} />
                    <div className={cn('absolute bottom-[calc(100%+6px)] right-0 z-[1002] rounded-lg border shadow-[0_8px_24px_rgba(0,0,0,0.18)] overflow-hidden min-w-[164px] flex flex-col gap-[2px] p-[2px]', isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200/80')}>
                      {[
                        { icon: Shield, label: 'Ver Geocercas'       },
                        { icon: Layers, label: 'Ver Zonas Base'      },
                        { icon: Route,  label: 'Mostrar Recorrido'   },
                        { icon: Share2, label: 'Compartir Ubicación' },
                      ].map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          onClick={() => setIsMoreMenuOpen(false)}
                          className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left', isDark ? 'hover:bg-zinc-700' : 'hover:bg-slate-100')}
                        >
                          <Icon className={cn('w-3 h-3 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')} strokeWidth={1.75} />
                          <span className={cn('text-[11px] font-medium', isDark ? 'text-zinc-300' : 'text-slate-600')}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div className={cn('flex items-stretch gap-px rounded-xl overflow-hidden', isDark ? 'bg-zinc-800' : 'bg-slate-100')}>
                  {[
                    { icon: Lock,        label: 'Parqueo',   onClick: undefined },
                    { icon: ShieldAlert, label: 'Captura',   onClick: () => window.dispatchEvent(new CustomEvent('captureVehicle', { detail: v })) },
                    { icon: Route,       label: 'Viajes',    onClick: () => window.dispatchEvent(new CustomEvent('tripVehicle', { detail: v })) },
                  ].map(({ icon: Icon, label, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className={cn('flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 transition-colors', isDark ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-white hover:bg-slate-50')}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')} strokeWidth={1.75} />
                      <span className={cn('text-[9.5px] font-semibold leading-tight text-center', isDark ? 'text-zinc-400' : 'text-slate-500')}>{label}</span>
                    </button>
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsMoreMenuOpen(prev => !prev); }}
                    className={cn('flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 transition-colors', isDark
                      ? (isMoreMenuOpen ? 'bg-zinc-800' : 'bg-zinc-900 hover:bg-zinc-800')
                      : (isMoreMenuOpen ? 'bg-slate-100' : 'bg-white hover:bg-slate-50'))}
                  >
                    <MoreHorizontal className={cn('w-4 h-4 shrink-0', isDark ? 'text-zinc-500' : 'text-slate-400')} strokeWidth={1.75} />
                    <span className={cn('text-[9.5px] font-semibold leading-tight text-center', isDark ? 'text-zinc-400' : 'text-slate-500')}>Más</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}

function MapEvents({ onMapClick, isDrawingMode, onDeselect, onZoomChange }: { onMapClick?: (lat: number, lng: number) => void; isDrawingMode?: boolean; onDeselect?: () => void; onZoomChange?: (zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleFlyTo = (e: Event) => {
      const customEvent = e as CustomEvent<{ position: [number, number]; offsetX?: number }>;
      const { position, offsetX } = customEvent.detail;
      if (!position || position.length !== 2) return;
      const zoom = 18;
      if (offsetX) {
        // Shift target left by offsetX px so the vehicle lands at the visible-area center
        const pt = map.project(L.latLng(position[0], position[1]), zoom);
        const adjusted = map.unproject(L.point(pt.x - offsetX, pt.y), zoom);
        map.flyTo(adjusted, zoom, { animate: true, duration: 2.0 });
      } else {
        map.flyTo(position, zoom, { animate: true, duration: 2.0 });
      }
    };

    const handleFitCluster = (e: Event) => {
      const { positions } = (e as CustomEvent<{ positions: [number, number][] }>).detail;
      if (positions.length > 0) {
        const bounds = L.latLngBounds(positions);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: VEHICLE_CLUSTER_ZOOM });
        }
      }
    };

    window.addEventListener('flyToVehicle', handleFlyTo);
    window.addEventListener('fitBoundsToVehicleCluster', handleFitCluster);
    return () => {
      window.removeEventListener('flyToVehicle', handleFlyTo);
      window.removeEventListener('fitBoundsToVehicleCluster', handleFitCluster);
    };
  }, [map]);

  useMapEvents({
    click(e) {
      if (isDrawingMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      } else if (!isDrawingMode && !(window as any)._markerJustClicked) {
        onDeselect?.();
      }
    },
    zoomend(e) {
      onZoomChange?.(e.target.getZoom());
    },
    movestart() {
      window.dispatchEvent(new CustomEvent('mapMoveStart'));
    },
    moveend() {
      window.dispatchEvent(new CustomEvent('mapMoveEnd'));
    },
    dragstart() {
      window.dispatchEvent(new CustomEvent('mapMoveStart'));
    },
  });
  return null;
}
