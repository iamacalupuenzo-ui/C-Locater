import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Flag, Clock, Route, Calendar, LocateFixed,
  ChevronDown, ChevronRight, Navigation, Power, AlertTriangle,
  Bike, Car, Truck, Bus, Settings2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Vehicle } from '../../lib/data';

// ─── Event types ───────────────────────────────────────────────────────────
export type TripEventType = 'speeding' | 'hard_braking' | 'harsh_acceleration' | 'sharp_turn';
export type EventSeverity  = 'low' | 'medium' | 'high';

export interface TripEventInstance {
  id: string;
  time: string;
  coords: [number, number];
  severity: EventSeverity;
  detail: string;
  address: string;
}

export interface TripEventGroup {
  type: TripEventType;
  instances: TripEventInstance[];
}

// ─── Mock trip data ────────────────────────────────────────────────────────

const ADDRESSES = [
  'Av. Universitaria 3206, San Miguel',
  'Panamericana Norte Km 15, Puente Piedra',
  'Av. Javier Prado Este 4600, Surco',
  'Jr. de la Unión 1045, Lima Centro',
  'Av. La Marina 2000, San Miguel',
  'Av. Brasil 2465, Breña',
  'Carretera Central Km 42, Ate',
  'Av. Benavides 5040, Miraflores',
  'Av. Arequipa 3800, San Isidro',
  'Av. Túpac Amaru Km 8, Comas',
  'Av. Colonial 450, Cercado de Lima',
  'Av. Próceres de la Independencia 1800, SJL',
];

// Coordenadas reales Lima, Perú — orden paralelo a ADDRESSES
const ADDRESS_COORDS: [number, number][] = [
  [-12.0762, -77.0849], // Av. Universitaria 3206, San Miguel
  [-11.8665, -77.0752], // Panamericana Norte Km 15, Puente Piedra
  [-12.1054, -76.9812], // Av. Javier Prado Este 4600, Surco
  [-12.0468, -77.0283], // Jr. de la Unión 1045, Lima Centro
  [-12.0691, -77.0793], // Av. La Marina 2000, San Miguel
  [-12.0611, -77.0492], // Av. Brasil 2465, Breña
  [-12.0587, -76.9178], // Carretera Central Km 42, Ate
  [-12.1317, -77.0055], // Av. Benavides 5040, Miraflores
  [-12.0974, -77.0359], // Av. Arequipa 3800, San Isidro
  [-11.9385, -77.0534], // Av. Túpac Amaru Km 8, Comas
  [-12.0501, -77.0583], // Av. Colonial 450, Cercado de Lima
  [-11.9810, -77.0076], // Av. Próceres de la Independencia 1800, SJL
];

export type TripStatus = 'completed' | 'in-progress' | 'cancelled';

export interface Trip {
  id: string;
  status: TripStatus;
  dateIso: string;
  dateLabel: string;
  time: string;
  endTime: string;
  origin: string;
  destination: string;
  originCoords: [number, number];
  destCoords: [number, number];
  distance: string;
  duration: string;
  events: number;
  // Coordenadas reales de ruta (cuando están disponibles)
  routeCoords?: [number, number][];      // ruta completa (completado/cancelado)
  traveledCoords?: [number, number][];   // tramo recorrido (en curso)
  remainingCoords?: [number, number][];  // tramo restante (en curso)
  roaming?: boolean;                     // en curso sin destino definido
  eventGroups?: TripEventGroup[];
}

// ─── Rutas reales Lima — TRK 221 (vehicle id '9') ─────────────────────────

// Viaje 0 (en curso): Av. Túpac Amaru Km 8, Comas → Av. Colonial 450, Cercado
// Traza Av. Túpac Amaru de norte a sur hasta Cercado de Lima
const TRK221_TRIP0_TRAVELED: [number, number][] = [
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
  [-12.0400, -77.0500], // posición actual del vehículo
];
const TRK221_TRIP0_REMAINING: [number, number][] = [
  [-12.0400, -77.0500],
  [-12.0425, -77.0516],
  [-12.0450, -77.0535],
  [-12.0475, -77.0558],
  [-12.0501, -77.0583],
];

// Viaje 4 (en curso — hoy 22/05/2026): Callao → Lima Centro vía Av. Colonial
// Ruta este-oeste que atraviesa Callao, Cercado, Breña hasta Lima Centro
const TRK221_TRIP4_TRAVELED: [number, number][] = [
  [-12.0498, -77.1082],  // Inicio — Av. Colonial / Av. Argentina, Callao
  [-12.0501, -77.0970],
  [-12.0500, -77.0855],
  [-12.0499, -77.0740],
  [-12.0497, -77.0625],  // Posición actual — Av. Colonial / Av. Brasil, Breña
];
const TRK221_TRIP4_REMAINING: [number, number][] = [
  [-12.0497, -77.0625],
  [-12.0490, -77.0535],
  [-12.0480, -77.0450],
  [-12.0465, -77.0370],
  [-12.0455, -77.0315],
  [-12.0453, -77.0268],  // Destino — Av. Colonial / Av. Abancay, Lima Centro
];

// Viaje 1 (completado — 21/05/2026): Av. Brasil, Breña → Av. Salaverry, Jesús María
// Ruta con AUTO-CRUCE: sube por Av. Brasil (norte), gira este por Av. Salaverry,
// baja a Av. Cuba, gira oeste cortando sobre el tramo norte → cruce visible en [-12.056, -77.045]
const TRK221_TRIP1_ROUTE: [number, number][] = [
  [-12.0820, -77.0530],  // Inicio — Breña sur (Av. Brasil / Av. Faustino)
  [-12.0760, -77.0510],  // Norte por Av. Brasil
  [-12.0700, -77.0490],  // Norte
  [-12.0640, -77.0470],  // Norte ← tramo norte, pasará por lon ≈-77.045
  [-12.0580, -77.0450],  // Norte ← SEGMENTO QUE SERÁ CRUZADO (lon -77.045)
  [-12.0530, -77.0440],  // Norte
  [-12.0480, -77.0420],  // Norte, llegando a Av. Salaverry — GIRO DERECHA (este)
  [-12.0480, -77.0370],  // Este por Av. Salaverry
  [-12.0480, -77.0310],  // Este — Av. Cuba
  [-12.0510, -77.0310],  // Sur
  [-12.0540, -77.0310],  // Sur
  [-12.0560, -77.0310],  // Sur — GIRO IZQUIERDA (oeste), vuelve cruzando
  [-12.0560, -77.0360],  // Oeste
  [-12.0560, -77.0410],  // Oeste, acercándose al cruce
  [-12.0560, -77.0450],  // ← PUNTO DE CRUCE (lat -12.056 cruza lon -77.045 del tramo norte)
  [-12.0560, -77.0500],  // Oeste (pasó el cruce)
  [-12.0555, -77.0570],  // Oeste
  [-12.0530, -77.0620],  // Destino — Av. Salaverry oeste, Jesús María
];

// Viaje 2 (completado): Panamericana Norte Km 15, Puente Piedra → Javier Prado Este 4600, Surco
// Baja por Panamericana Norte hasta Lima, gira al sureste por El Evitamiento hacia Surco
const TRK221_TRIP2_ROUTE: [number, number][] = [
  [-11.8665, -77.0752],
  [-11.8766, -77.0750],
  [-11.8868, -77.0747],
  [-11.8972, -77.0742],
  [-11.9077, -77.0733],
  [-11.9183, -77.0720],
  [-11.9290, -77.0702],
  [-11.9397, -77.0680],
  [-11.9502, -77.0653],
  [-11.9601, -77.0622],
  [-11.9694, -77.0587],
  [-11.9780, -77.0556],
  [-11.9860, -77.0536],
  [-11.9935, -77.0524],
  [-12.0005, -77.0518],
  [-12.0072, -77.0510],
  [-12.0135, -77.0495],
  [-12.0195, -77.0461],
  [-12.0255, -77.0405],
  [-12.0315, -77.0338],
  [-12.0375, -77.0265],
  [-12.0430, -77.0192],
  [-12.0485, -77.0115],
  [-12.0545, -77.0038],
  [-12.0608, -76.9965],
  [-12.0675, -76.9900],
  [-12.0745, -76.9862],
  [-12.0820, -76.9840],
  [-12.0900, -76.9828],
  [-12.0978, -76.9818],
  [-12.1054, -76.9812],
];

// Viaje 3 (completado): Jr. de la Unión, Lima Centro → Av. La Marina 2000, San Miguel
// Atraviesa Breña y Pueblo Libre hacia el oeste
const TRK221_TRIP3_ROUTE: [number, number][] = [
  [-12.0468, -77.0283],
  [-12.0475, -77.0330],
  [-12.0482, -77.0378],
  [-12.0490, -77.0428],
  [-12.0500, -77.0480],
  [-12.0515, -77.0540],
  [-12.0535, -77.0600],
  [-12.0558, -77.0650],
  [-12.0582, -77.0695],
  [-12.0612, -77.0730],
  [-12.0642, -77.0760],
  [-12.0668, -77.0778],
  [-12.0691, -77.0793],
];

// ─── Eventos reales TRK 221 — 4 tipos por viaje, coords exactas sobre la ruta
const TRK221_EVENTS: Record<number, TripEventGroup[]> = {
  // Viaje 0 (en curso): Comas → Colonial vía Túpac Amaru — 7 eventos
  0: [
    {
      type: 'speeding',
      instances: [
        { id: 'ev-0-sp-1', time: '07:14', coords: [-11.9760, -77.0537], severity: 'high',   detail: '92 km/h',       address: 'Av. Túpac Amaru Km 5, Comas'           },
        { id: 'ev-0-sp-2', time: '08:02', coords: [-12.0048, -77.0523], severity: 'high',   detail: '88 km/h',       address: 'Av. Túpac Amaru, Independencia'          },
      ],
    },
    {
      type: 'hard_braking',
      instances: [
        { id: 'ev-0-hb-1', time: '08:35', coords: [-12.0205, -77.0511], severity: 'high',   detail: '1.2 g',         address: 'Puente El Ejército, Rímac'               },
        { id: 'ev-0-hb-2', time: '08:48', coords: [-12.0365, -77.0503], severity: 'medium', detail: '0.8 g',         address: 'Av. Túpac Amaru, Cercado Norte'           },
      ],
    },
    {
      type: 'harsh_acceleration',
      instances: [
        { id: 'ev-0-ha-1', time: '06:52', coords: [-11.9535, -77.0535], severity: 'medium', detail: '0.9 g',         address: 'Av. Túpac Amaru Km 3, Comas'             },
        { id: 'ev-0-ha-2', time: '07:38', coords: [-11.9905, -77.0535], severity: 'medium', detail: '0.8 g',         address: 'Av. Túpac Amaru, Independencia Sur'       },
      ],
    },
    {
      type: 'sharp_turn',
      instances: [
        { id: 'ev-0-st-1', time: '07:52', coords: [-11.9685, -77.0536], severity: 'low',    detail: '0.6 g lateral', address: 'Av. Túpac Amaru Km 6, Comas'             },
      ],
    },
  ],
  // Viaje 1 (completado — 21/05/2026): Av. Brasil Breña → Av. Salaverry Jesús María (ruta con auto-cruce)
  1: [
    {
      type: 'speeding',
      instances: [
        { id: 'ev-1-sp-1', time: '09:12', coords: [-12.0700, -77.0490], severity: 'medium', detail: '82 km/h',       address: 'Av. Brasil, Breña'                        },
        { id: 'ev-1-sp-2', time: '09:22', coords: [-12.0580, -77.0450], severity: 'high',   detail: '96 km/h',       address: 'Av. Brasil / Av. Arica, Breña'            },
        { id: 'ev-1-sp-3', time: '09:38', coords: [-12.0480, -77.0370], severity: 'medium', detail: '79 km/h',       address: 'Av. Salaverry Este, Jesús María'          },
      ],
    },
    {
      type: 'hard_braking',
      instances: [
        { id: 'ev-1-hb-1', time: '09:32', coords: [-12.0480, -77.0420], severity: 'high',   detail: '1.2 g',         address: 'Av. Salaverry, giro al este'              },
        { id: 'ev-1-hb-2', time: '09:52', coords: [-12.0560, -77.0310], severity: 'medium', detail: '0.9 g',         address: 'Av. Cuba, giro al oeste'                  },
        { id: 'ev-1-hb-3', time: '10:08', coords: [-12.0560, -77.0410], severity: 'low',    detail: '0.7 g',         address: 'Jr. Huiracocha, regreso oeste'            },
      ],
    },
    {
      type: 'harsh_acceleration',
      instances: [
        { id: 'ev-1-ha-1', time: '09:05', coords: [-12.0760, -77.0510], severity: 'medium', detail: '0.9 g',         address: 'Av. Brasil, inicio, Breña'                },
        { id: 'ev-1-ha-2', time: '09:55', coords: [-12.0560, -77.0360], severity: 'high',   detail: '1.1 g',         address: 'Jr. Sáenz Peña, salida de semáforo'       },
      ],
    },
    {
      type: 'sharp_turn',
      instances: [
        { id: 'ev-1-st-1', time: '09:31', coords: [-12.0480, -77.0420], severity: 'medium', detail: '0.8 g lateral', address: 'Av. Salaverry, giro brusco al este'       },
        { id: 'ev-1-st-2', time: '09:51', coords: [-12.0560, -77.0310], severity: 'high',   detail: '0.9 g lateral', address: 'Av. Cuba, giro brusco al oeste'           },
        { id: 'ev-1-st-3', time: '10:14', coords: [-12.0560, -77.0450], severity: 'low',    detail: '0.5 g lateral', address: 'Punto de cruce — Breña / Jesús María'     },
      ],
    },
  ],
  // Viaje 2 (completado): Puente Piedra → Javier Prado Este, Surco — 7 eventos
  2: [
    {
      type: 'speeding',
      instances: [
        { id: 'ev-2-sp-1', time: '14:05', coords: [-11.9183, -77.0720], severity: 'medium', detail: '82 km/h',       address: 'Panamericana Norte, Los Olivos'           },
        { id: 'ev-2-sp-2', time: '14:32', coords: [-11.9860, -77.0536], severity: 'low',    detail: '76 km/h',       address: 'Panamericana Norte, Lima Norte'           },
      ],
    },
    {
      type: 'hard_braking',
      instances: [
        { id: 'ev-2-hb-1', time: '15:10', coords: [-12.0135, -77.0495], severity: 'medium', detail: '0.9 g',         address: 'El Evitamiento, Lima Centro'              },
      ],
    },
    {
      type: 'harsh_acceleration',
      instances: [
        { id: 'ev-2-ha-1', time: '14:18', coords: [-11.9397, -77.0680], severity: 'high',   detail: '1.1 g',         address: 'Panamericana Norte, Independencia'        },
        { id: 'ev-2-ha-2', time: '13:58', coords: [-11.8972, -77.0742], severity: 'medium', detail: '0.9 g',         address: 'Panamericana Norte Km 12, Puente Piedra'  },
      ],
    },
    {
      type: 'sharp_turn',
      instances: [
        { id: 'ev-2-st-1', time: '15:30', coords: [-12.0315, -77.0338], severity: 'low',    detail: '0.6 g lateral', address: 'El Evitamiento, Lima Este'                },
        { id: 'ev-2-st-2', time: '16:05', coords: [-12.0608, -76.9965], severity: 'medium', detail: '0.8 g lateral', address: 'Av. Javier Prado Este, La Victoria'       },
      ],
    },
  ],
  // Viaje 3 (completado): Jr. de la Unión → Av. La Marina San Miguel — 5 eventos
  3: [
    {
      type: 'speeding',
      instances: [
        { id: 'ev-3-sp-1', time: '09:28', coords: [-12.0535, -77.0600], severity: 'low',    detail: '75 km/h',       address: 'Av. Colonial, Pueblo Libre'               },
      ],
    },
    {
      type: 'hard_braking',
      instances: [
        { id: 'ev-3-hb-1', time: '09:15', coords: [-12.0500, -77.0480], severity: 'medium', detail: '0.9 g',         address: 'Av. Brasil, Breña'                        },
        { id: 'ev-3-hb-2', time: '09:42', coords: [-12.0482, -77.0378], severity: 'low',    detail: '0.7 g',         address: 'Jr. de la Unión, Lima Centro'             },
      ],
    },
    {
      type: 'harsh_acceleration',
      instances: [
        { id: 'ev-3-ha-1', time: '09:35', coords: [-12.0582, -77.0695], severity: 'medium', detail: '0.8 g',         address: 'Av. La Marina, Pueblo Libre'              },
      ],
    },
    {
      type: 'sharp_turn',
      instances: [
        { id: 'ev-3-st-1', time: '09:52', coords: [-12.0642, -77.0760], severity: 'low',    detail: '0.5 g lateral', address: 'Av. La Marina, San Miguel'                },
      ],
    },
  ],
};

// Mapa tripIndex → datos de ruta (origin/destination/coords anulan los generados por seed)
const TRK221_ROUTES: Record<number, {
  routeCoords?: [number, number][];
  traveledCoords?: [number, number][];
  remainingCoords?: [number, number][];
  origin?: string;
  destination?: string;
  originCoords?: [number, number];
  destCoords?: [number, number];
  roaming?: boolean;
  status?: TripStatus;
  dateIso?: string;
  dateLabel?: string;
}> = {
  0: { traveledCoords: TRK221_TRIP0_TRAVELED, roaming: true,
       origin: 'Av. Túpac Amaru Km 8, Comas', originCoords: [-11.9385, -77.0534] },
  1: {
    routeCoords:  TRK221_TRIP1_ROUTE,
    origin:       'Av. Brasil 3200, Breña',
    destination:  'Av. Salaverry 3205, Jesús María',
    originCoords: [-12.0820, -77.0530],
    destCoords:   [-12.0530, -77.0620],
  },
  2: { routeCoords: TRK221_TRIP2_ROUTE },
  3: { routeCoords: TRK221_TRIP3_ROUTE },
  4: {
    status:        'in-progress',
    dateIso:       '2026-05-22',
    dateLabel:     '22/05/2026',
    traveledCoords:  TRK221_TRIP4_TRAVELED,
    remainingCoords: TRK221_TRIP4_REMAINING,
    origin:       'Av. Colonial 100, Callao',
    destination:  'Av. Colonial 2600, Lima Centro',
    originCoords: [-12.0498, -77.1082],
    destCoords:   [-12.0453, -77.0268],
  },
};

export function generateTrips(vehicle: Vehicle): Trip[] {
  const seed = parseInt(vehicle.id, 10) || 1;
  const base = new Date(2026, 4, 22);
  const trips: Trip[] = [];

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(i * (1 + (seed % 3) * 0.5));
    const d = new Date(base);
    d.setDate(d.getDate() - daysAgo);

    const hour   = 6  + ((seed * (i + 1) * 3) % 14);
    const minute = (seed * (i + 2) * 7) % 60;
    const dur    = 18 + ((seed * (i + 1)) % 45);
    const dist   = (8.2 + ((seed * (i + 1) * 1.3) % 28)).toFixed(1);
    const end    = new Date(d);
    end.setMinutes(end.getMinutes() + dur);

    const tripStatus: TripStatus =
      i === 0                         ? 'in-progress' :
      (seed + i) % 7 === 0            ? 'cancelled' :
                                         'completed';

    const trk221Route   = vehicle.id === '9' ? (TRK221_ROUTES[i] ?? {}) : {};
    const trk221Events  = vehicle.id === '9' ? TRK221_EVENTS[i] : undefined;

    trips.push({
      id:        `trip-${vehicle.id}-${i}`,
      status:    tripStatus,
      dateIso:   d.toISOString().slice(0, 10),
      dateLabel: d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time:      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      endTime:   `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
      origin:       ADDRESSES[(seed + i * 2)     % ADDRESSES.length],
      destination:  ADDRESSES[(seed + i * 2 + 1) % ADDRESSES.length],
      originCoords: ADDRESS_COORDS[(seed + i * 2)     % ADDRESS_COORDS.length],
      destCoords:   ADDRESS_COORDS[(seed + i * 2 + 1) % ADDRESS_COORDS.length],
      distance:  `${dist} km`,
      duration:  `${dur} min`,
      events:      trk221Events
        ? trk221Events.reduce((s, g) => s + g.instances.length, 0)
        : (seed * (i + 1)) % 5,
      eventGroups: trk221Events,
      ...trk221Route,
    });
  }
  return trips;
}

const VEHICLE_STATUS = {
  active:  { color: '#34C759' },
  stopped: { color: '#FF9500' },
  offline: { color: '#94a3b8' },
} as const;

function getGpsStatusBadge(reportStatus: string) {
  switch (reportStatus) {
    case 'reporting':    return { label: 'Transmitiendo', cls: 'text-emerald-500 bg-emerald-500/10', ping: true  };
    case 'no-signal':   return { label: 'Sin señal',      cls: 'text-amber-500 bg-amber-500/10',   ping: false };
    case 'low-signal':  return { label: 'Señal baja',     cls: 'text-orange-500 bg-orange-500/10', ping: false };
    case 'disconnected': return { label: 'Desconectado',  cls: 'text-slate-500 bg-slate-500/10',   ping: false };
    default:            return { label: 'Inactivo',        cls: 'text-slate-500 bg-slate-500/10',   ping: false };
  }
}

const VEHICLE_ICON = { motorcycle: Bike, truck: Truck, bus: Bus, machinery: Settings2, car: Car };

// ─── TripPanel ─────────────────────────────────────────────────────────────

interface TripPanelProps {
  vehicle: Vehicle;
  isDark?: boolean;
  onTripSelect?: (tripId: string | null) => void;
}

type FilterMode = 'hoy' | 'todos' | 'fecha';

const TODAY_ISO = new Date(2026, 4, 22).toISOString().slice(0, 10);

export function TripPanel({ vehicle, isDark = false, onTripSelect }: TripPanelProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('hoy');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setShowScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  useEffect(() => { setTimeout(checkScroll, 80); }, [filterMode, selectedDate, checkScroll]);

  function handleOpenEvents(tripId: string, groups: TripEventGroup[]) {
    // Si el viaje no está seleccionado, seleccionarlo para mostrar la ruta primero
    if (selectedTripId !== tripId) {
      setSelectedTripId(tripId);
      onTripSelect?.(tripId);
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        window.dispatchEvent(new CustomEvent('tripRouteSelected', {
          detail: {
            tripId,
            status: trip.status,
            roaming: trip.roaming,
            origin: trip.originCoords,
            destination: trip.destCoords,
            originLabel: trip.origin,
            destLabel: trip.destination,
            routeCoords:     trip.routeCoords,
            traveledCoords:  trip.traveledCoords,
            remainingCoords: trip.remainingCoords,
          },
        }));
      }
    }
    window.dispatchEvent(new CustomEvent('tripEventsSelected', { detail: { tripId, groups } }));
  }

  function handleSelectTrip(tripId: string) {
    const next = selectedTripId === tripId ? null : tripId;
    setSelectedTripId(next);
    onTripSelect?.(next);
    const trip = next ? trips.find(t => t.id === next) : null;

    if (next && trip) {
      window.dispatchEvent(new CustomEvent('tripRouteSelected', {
        detail: {
          tripId: next,
          status: trip.status,
          roaming: trip.roaming,
          origin: trip.originCoords,
          destination: trip.destCoords,
          originLabel: trip.origin,
          destLabel: trip.destination,
          routeCoords:    trip.routeCoords,
          traveledCoords: trip.traveledCoords,
          remainingCoords: trip.remainingCoords,
        },
      }));
      window.dispatchEvent(new CustomEvent('tripEventsSelected', {
        detail: trip.eventGroups ? { tripId: next, groups: trip.eventGroups } : null,
      }));
    } else {
      window.dispatchEvent(new CustomEvent('tripRouteSelected', { detail: null }));
      window.dispatchEvent(new CustomEvent('tripEventsSelected', { detail: null }));
    }
  }

  const allTrips = useMemo(() => generateTrips(vehicle), [vehicle]);
  const trips    = useMemo(() => {
    if (filterMode === 'todos') return allTrips;
    if (filterMode === 'hoy')   return allTrips.filter(t => t.dateIso === TODAY_ISO);
    return selectedDate ? allTrips.filter(t => t.dateIso === selectedDate) : [];
  }, [allTrips, filterMode, selectedDate]);

  const vStatus     = VEHICLE_STATUS[vehicle.status] ?? VEHICLE_STATUS.offline;
  const VehicleIcon = VEHICLE_ICON[vehicle.type as keyof typeof VEHICLE_ICON] ?? Car;
  const gpsDevice   = vehicle.gpsDevices?.[0];
  const gpsBadge    = getGpsStatusBadge(gpsDevice?.reportStatus ?? 'disconnected');
  const ignitionOn  = gpsDevice?.ignition === 'on';
  // Ícono verde cuando transmite, color de estado vehicular en cualquier otro caso
  const iconColor   = gpsBadge.ping ? '#10b981' : vStatus.color;

  const panel = cn(
    'rounded-md shadow-sm border flex flex-col overflow-hidden backdrop-blur-2xl',
    isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
  );

  const divider = cn('h-px shrink-0', isDark ? 'bg-zinc-800' : 'bg-neutral-100');

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex flex-col w-full h-full overflow-hidden', panel)}
    >
      {/* ── Header: vehículo ── */}
      <div className={cn('flex items-center gap-2.5 px-4 py-3 shrink-0', isDark ? 'bg-zinc-900/96' : 'bg-white/94')}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ background: `${iconColor}15`, borderColor: `${iconColor}30` }}
        >
          <VehicleIcon className="w-[18px] h-[18px]" style={{ color: iconColor }} strokeWidth={1.75} />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className={cn('text-[13px] font-semibold leading-none', isDark ? 'text-zinc-100' : 'text-neutral-800')}>
              {vehicle.plate.replace(/-/g, '')}
            </span>
            <span className={cn('text-[10px] font-medium leading-none', isDark ? 'text-zinc-500' : 'text-neutral-400')}>
              {vehicle.engineCode}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {/* Badge señal GPS — estilo ESAD */}
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 shrink-0', gpsBadge.cls)}>
              <span className="relative flex items-center justify-center w-3.5 h-3.5">
                {gpsBadge.ping && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />}
                <LocateFixed className="w-3.5 h-3.5 relative" />
              </span>
              {gpsBadge.label}
            </span>
            {/* Badge ignición */}
            {gpsDevice && (
              <span className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0',
                ignitionOn ? 'text-emerald-500 bg-emerald-500/10' : (isDark ? 'text-zinc-500 bg-zinc-800' : 'text-slate-400 bg-slate-100'),
              )}>
                <Power className="w-2.5 h-2.5" />
                {ignitionOn ? 'ON' : 'OFF'}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className={cn('text-[15px] font-bold leading-none', isDark ? 'text-zinc-100' : 'text-neutral-800')}>
            {trips.length}
          </span>
          <span className={cn('text-[10px] mt-0.5', isDark ? 'text-zinc-500' : 'text-neutral-400')}>viajes</span>
        </div>
      </div>

      <div className={divider} />

      {/* ── Filtros ── */}
      <div className={cn('relative z-[100] px-1.5 py-2.5 shrink-0 flex items-center gap-1', isDark ? 'bg-zinc-900/96' : 'bg-white/94')}>

        {/* Hoy */}
        <button
          onClick={() => { setFilterMode('hoy'); setFilterOpen(false); }}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors',
            filterMode === 'hoy'
              ? (isDark ? 'text-zinc-100 bg-zinc-800' : 'text-neutral-900 bg-neutral-100')
              : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70'),
          )}
        >
          <LocateFixed className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          <span>Hoy</span>
        </button>

        {/* Todos */}
        <button
          onClick={() => { setFilterMode('todos'); setFilterOpen(false); }}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors',
            filterMode === 'todos'
              ? (isDark ? 'text-zinc-100 bg-zinc-800' : 'text-neutral-900 bg-neutral-100')
              : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70'),
          )}
        >
          <span>Todos</span>
        </button>

        {/* Por fecha dropdown */}
        <div className="relative">
          <button
            onClick={() => { setFilterMode('fecha'); setFilterOpen(p => !p); }}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors',
              filterMode === 'fecha'
                ? (isDark ? 'text-zinc-100 bg-zinc-800' : 'text-neutral-900 bg-neutral-100')
                : (isDark ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70'),
            )}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>{filterMode === 'fecha' && selectedDate ? selectedDate.split('-').reverse().join('/') : 'Fecha'}</span>
            <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform', filterOpen && 'rotate-180')} strokeWidth={2.5} />
          </button>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  'absolute top-full left-0 mt-1 z-20 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.18)] border p-2',
                  isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-neutral-100',
                )}
              >
                <input
                  type="date"
                  value={selectedDate}
                  max={TODAY_ISO}
                  onChange={e => { setSelectedDate(e.target.value); setFilterOpen(false); }}
                  className={cn(
                    'text-[12px] font-medium rounded-md px-2 py-1.5 border outline-none transition-colors',
                    isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-200 focus:border-zinc-500'
                      : 'bg-white border-neutral-200 text-neutral-700 focus:border-blue-400',
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={divider} />

      {/* ── Lista de viajes ── */}
      <div className="relative flex flex-col flex-1 min-h-0">
      <div ref={listRef} onScroll={checkScroll} className="overflow-y-auto flex flex-col flex-1 pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {trips.length === 0 ? (
          <div className="py-8 flex flex-col items-center gap-2">
            <Navigation className={cn('w-5 h-5', isDark ? 'text-zinc-700' : 'text-neutral-300')} strokeWidth={1.5} />
            <p className={cn('text-[12px] font-medium', isDark ? 'text-zinc-500' : 'text-neutral-400')}>
              {filterMode === 'hoy' ? 'Sin viajes hoy' : filterMode === 'fecha' && !selectedDate ? 'Selecciona una fecha' : 'Sin viajes para esta fecha'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col px-3 py-2 gap-2">
            {trips.map(trip => {
              const isSelected = selectedTripId === trip.id;
              return (
              <div
                key={trip.id}
                onClick={() => handleSelectTrip(trip.id)}
                className={cn(
                  'rounded-[10px] border cursor-pointer transition-all py-3 px-3',
                  isSelected
                    ? (isDark ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50/70 border-blue-400/80')
                    : (isDark
                      ? 'bg-zinc-800/60 border-transparent hover:border-zinc-700'
                      : 'bg-white border-transparent hover:border-slate-200'),
                )}
              >
                {/* Fecha + estado | hora */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[12px] font-semibold', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                      {trip.dateLabel}
                    </span>
                    {trip.status === 'in-progress' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex items-center justify-center w-2 h-2">
                          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative" />
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600">En curso</span>
                      </div>
                    ) : trip.status === 'cancelled' ? (
                      <span className="text-[10px] font-semibold text-red-400">No completado</span>
                    ) : (
                      <span className="text-[10px] font-medium text-blue-500">Completado</span>
                    )}
                  </div>

                  <span className={cn('text-[11px]', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                    {trip.time} – {trip.endTime}
                  </span>
                </div>

                {/* Origen → Destino */}
                <div className="flex flex-col gap-1 mb-2.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 mt-[1px] shrink-0" strokeWidth={2} />
                    <span className={cn('text-[11px] leading-snug', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                      {trip.origin}
                    </span>
                  </div>
                  <>
                    <div className={cn('ml-[6px] w-px h-[4px]', isDark ? 'bg-zinc-700' : 'bg-slate-200')} />
                    <div className="flex items-start gap-2">
                      <Flag className="w-3.5 h-3.5 text-emerald-500 mt-[1px] shrink-0" strokeWidth={2} />
                      <span className={cn('text-[11px] leading-snug', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                        {trip.roaming ? 'Rastreo en tiempo real' : trip.destination}
                      </span>
                    </div>
                  </>
                </div>

                {/* Stats + Eventos */}
                <div className={cn('flex items-center justify-between pt-2 border-t',
                  isDark ? 'border-zinc-700' : 'border-slate-100',
                )}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Route className={cn('w-3 h-3', isDark ? 'text-zinc-500' : 'text-slate-400')} strokeWidth={1.75} />
                      <span className={cn('text-[11px] font-medium', isDark ? 'text-zinc-300' : 'text-slate-600')}>{trip.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className={cn('w-3 h-3', isDark ? 'text-zinc-500' : 'text-slate-400')} strokeWidth={1.75} />
                      <span className={cn('text-[11px] font-medium', isDark ? 'text-zinc-300' : 'text-slate-600')}>{trip.duration}</span>
                    </div>
                  </div>

                  {trip.events > 0 && (
                    trip.eventGroups ? (
                      <button
                        onClick={e => { e.stopPropagation(); handleOpenEvents(trip.id, trip.eventGroups!); }}
                        className={cn(
                          'flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors',
                          isDark ? 'hover:bg-amber-500/10' : 'hover:bg-amber-50',
                        )}
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400" strokeWidth={1.75} />
                        <span className={cn('text-[11px] font-medium', isDark ? 'text-zinc-300' : 'text-slate-600')}>
                          {trip.events} {trip.events === 1 ? 'evento' : 'eventos'}
                        </span>
                        <ChevronRight className="w-3 h-3 text-amber-400" strokeWidth={2.5} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className={cn('w-3 h-3', trip.status === 'cancelled' ? 'text-red-400' : 'text-amber-400')} strokeWidth={1.75} />
                        <span className={cn('text-[11px] font-medium', isDark ? 'text-zinc-300' : 'text-slate-600')}>
                          {trip.events} {trip.events === 1 ? 'evento' : 'eventos'}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            );})}
          </div>
        )}
      </div>
      <AnimatePresence>
        {showScrollHint && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
    </motion.div>
  );
}
