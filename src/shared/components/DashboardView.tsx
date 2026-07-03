import { useMemo, useState, useRef, useEffect, type ElementType } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip as RechartsTooltip, AreaChart, Area,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Truck, Activity, WifiOff, AlertTriangle, Route,
  Bike, Car, Bus, Settings2, TrendingUp, Gauge, Zap, Clock,
  Filter, Search,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeContext';
import { FLEET_DATA } from '../lib/data';

// ─── Mock data ───────────────────────────────────────────────────────────────

const COUNTRY_DATA = [
  { country: 'Perú',      lat: -9.19,  lng: -75.01, count: 12 },
  { country: 'Chile',     lat: -35.67, lng: -71.54,  count: 4  },
  { country: 'Colombia',  lat:  4.57,  lng: -74.29,  count: 3  },
  { country: 'Ecuador',   lat: -1.83,  lng: -78.18,  count: 3  },
  { country: 'Argentina', lat: -38.42, lng: -63.62,  count: 2  },
];
const COUNTRY_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

const HOURLY_DATA = [
  { h: '00', v: 2  }, { h: '01', v: 1  }, { h: '02', v: 1  }, { h: '03', v: 0  },
  { h: '04', v: 1  }, { h: '05', v: 4  }, { h: '06', v: 9  }, { h: '07', v: 15 },
  { h: '08', v: 19 }, { h: '09', v: 21 }, { h: '10', v: 20 }, { h: '11', v: 18 },
  { h: '12', v: 16 }, { h: '13', v: 18 }, { h: '14', v: 19 }, { h: '15', v: 20 },
  { h: '16', v: 17 }, { h: '17', v: 14 }, { h: '18', v: 11 }, { h: '19', v: 8  },
  { h: '20', v: 6  }, { h: '21', v: 5  }, { h: '22', v: 4  }, { h: '23', v: 3  },
];

const KM_TREND = [
  { day: 'Lun', km: 12400 },
  { day: 'Mar', km: 14200 },
  { day: 'Mié', km: 11800 },
  { day: 'Jue', km: 15600 },
  { day: 'Vie', km: 13900 },
  { day: 'Sáb', km: 8400  },
  { day: 'Hoy', km: 10200 },
];

const RECENT_ALARMS = [
  { type: 'Vel. excesiva', plate: 'MOT-101', time: '10:23', color: '#ef4444' },
  { type: 'Sin señal',     plate: 'HBF-204', time: '09:15', color: '#f59e0b' },
  { type: 'Salida zona',   plate: 'ACD-345', time: '08:50', color: '#f97316' },
  { type: 'Vel. excesiva', plate: 'CLP-899', time: '08:22', color: '#ef4444' },
  { type: 'Sin señal',     plate: 'TRK-012', time: '07:44', color: '#f59e0b' },
  { type: 'Zona restric.', plate: 'BUS-023', time: '07:10', color: '#8b5cf6' },
];

const TYPE_META: Record<string, { label: string; icon: ElementType; color: string }> = {
  truck:      { label: 'Camión',     icon: Truck,     color: '#3B82F6' },
  car:        { label: 'Auto',       icon: Car,       color: '#10B981' },
  motorcycle: { label: 'Moto',       icon: Bike,      color: '#F59E0B' },
  bus:        { label: 'Bus',        icon: Bus,       color: '#8B5CF6' },
  machinery:  { label: 'Maquinaria', icon: Settings2, color: '#EF4444' },
};

const GPS_SERVICES = [
  { label: 'SVR Plus',         count: 10, color: '#0052CC' },
  { label: 'SVR Básico',       count: 7,  color: '#34C759' },
  { label: 'SVR Contingencia', count: 4,  color: '#8B5CF6' },
  { label: 'SVR X',            count: 3,  color: '#FF9F0A' },
];

// ─── FilterSelect — mismo patrón que CaminosModule ───────────────────────────

function FilterSelect({ label, value, options, onSelect, allLabel = 'Todos' }: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  const isActive = value !== allLabel;

  useEffect(() => {
    if (!open) return;
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 200) });
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-lg text-xs min-w-[160px] transition-colors',
          isActive ? 'border-gray-700 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300',
        )}
      >
        <span className="truncate">{value}</span>
        <Filter className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-gray-700' : 'text-gray-400')} />
      </button>

      {open && pos && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => { setOpen(false); setQuery(''); }} />
          <div
            className="fixed z-[9999] bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden"
            style={{ top: pos.top, left: pos.left, minWidth: pos.width, maxWidth: 240 }}
          >
            <div className="p-2 border-b border-gray-50">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder="Buscar..."
                  className="bg-transparent outline-none text-xs w-full text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              <button
                onClick={() => { onSelect(allLabel); setOpen(false); setQuery(''); }}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-xs transition-colors', value === allLabel ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50')}
              >
                {allLabel}
              </button>
              {filtered.map(o => (
                <button
                  key={o}
                  onClick={() => { onSelect(o); setOpen(false); setQuery(''); }}
                  className={cn('w-full text-left px-3 py-2 rounded-lg text-xs transition-colors', value === o ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50')}
                >
                  {o}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-3 text-center text-xs text-gray-400">Sin resultados</p>
              )}
            </div>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createBubbleIcon(count: number, color: string): L.DivIcon {
  const size = count >= 10 ? 38 : count >= 4 ? 30 : 24;
  const fs   = count >= 10 ? 13 : 10;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color}22;border:2px solid ${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:700;color:${color};font-family:-apple-system,sans-serif;">${count}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function ChartTip({ active, payload, label, isDark, unit = '' }: {
  active?: boolean; payload?: { value: number }[]; label?: string; isDark: boolean; unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cn(
      'px-2.5 py-1.5 rounded-md text-[11px] pointer-events-none',
      isDark ? 'bg-zinc-800 border border-zinc-700 text-white' : 'bg-white/94 border border-white/70 shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-slate-900',
    )}>
      <div className={cn('text-[9.5px] mb-0.5', isDark ? 'text-zinc-400' : 'text-slate-500')}>{label}</div>
      <div className="font-bold">{payload[0].value}{unit}</div>
    </div>
  );
}

function PanelCard({ children, className, isDark }: { children: React.ReactNode; className?: string; isDark: boolean }) {
  return (
    <div className={cn(
      'rounded-md border',
      isDark ? 'bg-zinc-900/96 border-zinc-800' : 'bg-white/94 border-white/70',
      className,
    )}>
      {children}
    </div>
  );
}

function SectionLabel({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <span className={cn(
      'text-[9.5px] font-semibold uppercase tracking-wider block',
      isDark ? 'text-zinc-500' : 'text-slate-400',
    )}>
      {children}
    </span>
  );
}

function MiniBar({ value, max, color, isDark }: { value: number; max: number; color: string; isDark: boolean }) {
  return (
    <div className={cn('h-1 rounded-full overflow-hidden', isDark ? 'bg-zinc-800' : 'bg-neutral-100')}>
      <div className="h-full rounded-full" style={{ width: `${(value / Math.max(max, 1)) * 100}%`, background: color }} />
    </div>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div className={cn('h-px shrink-0', isDark ? 'bg-zinc-800' : 'bg-neutral-100')} />;
}


// ─── Main component ──────────────────────────────────────────────────────────

export function DashboardView() {
  const { isDark } = useTheme();

  const [selectedGroup,    setSelectedGroup]    = useState('Todos');
  const [selectedSubgroup, setSelectedSubgroup] = useState('Todos');

  // Todos los grupos disponibles — groups vive en gpsDevices[].groups
  const allGroups = useMemo(() => {
    const set = new Set<string>();
    FLEET_DATA.forEach(v => v.gpsDevices?.forEach(d => d.groups?.forEach(g => set.add(g.name))));
    return [...set].sort();
  }, []);

  // Subgrupos disponibles según grupo seleccionado
  const availableSubgroups = useMemo(() => {
    const set = new Set<string>();
    FLEET_DATA.forEach(v => v.gpsDevices?.forEach(d => d.groups?.forEach(g => {
      if (selectedGroup === 'Todos' || g.name === selectedGroup) {
        if (g.subgroup) set.add(g.subgroup);
      }
    })));
    return [...set].sort();
  }, [selectedGroup]);

  // Flota filtrada por grupo y subgrupo
  const filteredFleet = useMemo(() => {
    if (selectedGroup === 'Todos' && selectedSubgroup === 'Todos') return FLEET_DATA;
    return FLEET_DATA.filter(v =>
      v.gpsDevices?.some(d =>
        d.groups?.some(g => {
          const groupOk    = selectedGroup    === 'Todos' || g.name     === selectedGroup;
          const subgroupOk = selectedSubgroup === 'Todos' || g.subgroup === selectedSubgroup;
          return groupOk && subgroupOk;
        })
      )
    );
  }, [selectedGroup, selectedSubgroup]);

  const stats = useMemo(() => {
    const total    = filteredFleet.length;
    const active   = filteredFleet.filter(v => v.status === 'active').length;
    const stopped  = filteredFleet.filter(v => v.status === 'stopped').length;
    const offline  = filteredFleet.filter(v => v.status === 'offline').length;
    const alarms   = filteredFleet.filter(v => (v.alarmCount ?? 0) > 0).length;
    const totalKm  = filteredFleet.reduce((s, v) => s + (parseInt(v.odometer.replace(/\D/g, ''), 10) || 0), 0);
    const activeVehicles = filteredFleet.filter(v => v.status === 'active');
    const avgSpeed = activeVehicles.length
      ? activeVehicles.reduce((s, v) => s + (parseInt(v.speed.replace(/\D/g, ''), 10) || 0), 0) / activeVehicles.length
      : 0;
    return { total, active, stopped, offline, alarms, totalKm, avgSpeed: Math.round(avgSpeed) };
  }, [filteredFleet]);

  const byType = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredFleet.forEach(v => { counts[v.type] = (counts[v.type] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, name: TYPE_META[type]?.label ?? type, count, color: TYPE_META[type]?.color ?? '#94a3b8' }))
      .sort((a, b) => b.count - a.count);
  }, [filteredFleet]);

  const topKm = useMemo(() =>
    [...filteredFleet]
      .sort((a, b) => (parseInt(b.odometer.replace(/\D/g, ''), 10) || 0) - (parseInt(a.odometer.replace(/\D/g, ''), 10) || 0))
      .slice(0, 6),
  [filteredFleet]);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

  const textMain  = isDark ? 'text-zinc-100'  : 'text-neutral-800';
  const textMuted = isDark ? 'text-zinc-500'  : 'text-slate-400';
  const textSub   = isDark ? 'text-zinc-300'  : 'text-neutral-700';
  const chartAxis = { fontSize: 9.5, fill: isDark ? '#71717a' : '#94a3b8' };

  const isFiltered = selectedGroup !== 'Todos' || selectedSubgroup !== 'Todos';

  const kpis = [
    { label: 'Total unidades', value: String(stats.total),   icon: Truck,         iconBg: 'bg-blue-500/10',    iconColor: 'text-blue-500'    },
    { label: 'En ruta',        value: String(stats.active),  icon: Activity,      iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    { label: 'Detenidos',      value: String(stats.stopped), icon: TrendingUp,    iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-500'   },
    { label: 'Sin señal',      value: String(stats.offline), icon: WifiOff,       iconBg: 'bg-red-500/10',     iconColor: 'text-red-500'     },
    { label: 'Con alarma',     value: String(stats.alarms),  icon: AlertTriangle, iconBg: 'bg-orange-500/10',  iconColor: 'text-orange-500'  },
    { label: 'Total km',       value: `${Math.round(stats.totalKm / 1000)}k km`, icon: Route, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500' },
  ];

  return (
    <div className={cn('flex flex-col h-full', isDark ? 'bg-zinc-950' : 'bg-neutral-100')}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className={cn('px-8 pt-6 pb-4 shrink-0 border-b', isDark ? 'border-zinc-800' : 'border-neutral-200')}>
        <div className="flex items-start justify-between gap-6">

          {/* Título */}
          <div>
            <p className={cn('text-xs font-medium tracking-wide mb-1', isDark ? 'text-zinc-500' : 'text-gray-400')}>Monitoreo</p>
            <h1 className={cn('text-[22px] font-semibold tracking-tight', isDark ? 'text-zinc-100' : 'text-gray-900')}>Dashboard</h1>
            <p className={cn('text-sm mt-0.5', isDark ? 'text-zinc-400' : 'text-gray-500')}>
              Resumen operativo de la flota
              {isFiltered && (
                <span className={cn('ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded', isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600')}>
                  Filtrado · {stats.total} unidades
                </span>
              )}
            </p>
          </div>

          {/* Filtros + badge */}
          <div className="flex items-end gap-4 shrink-0 pb-0.5">
            <FilterSelect
              label="Grupo"
              value={selectedGroup}
              options={allGroups}
              onSelect={v => { setSelectedGroup(v); setSelectedSubgroup('Todos'); }}
              allLabel="Todos"
            />
            <FilterSelect
              label="Subgrupo"
              value={selectedSubgroup}
              options={availableSubgroups}
              onSelect={setSelectedSubgroup}
              allLabel="Todos"
            />
            <div className={cn('flex items-center gap-1.5 text-[10px] font-semibold pb-1', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En tiempo real
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className={cn('px-5 flex items-center border-b shrink-0', isDark ? 'border-zinc-800' : 'border-neutral-200')}>
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={cn(
              'flex items-center gap-2.5 py-3 pr-6',
              i > 0 && cn('pl-6 border-l', isDark ? 'border-zinc-800' : 'border-neutral-200'),
            )}>
              <div className={cn('w-6 h-6 rounded-md flex items-center justify-center shrink-0', k.iconBg)}>
                <Icon className={cn('w-3 h-3', k.iconColor)} strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={cn('text-[14px] font-bold tabular-nums leading-none', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                  {k.value}
                </span>
                <span className={cn('text-[9.5px] font-medium leading-none', textMuted)}>
                  {k.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Scrollable content ────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 flex flex-col gap-4">

          {/* ── Row 1: Map + Distribución por país ──────────────── */}
          <div className="flex gap-4" style={{ height: 280 }}>

            <PanelCard isDark={isDark} className="flex-1 overflow-hidden">
              <MapContainer
                center={[5, -65]}
                zoom={3}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={true}
                doubleClickZoom={false}
              >
                <TileLayer url={tileUrl} />
                {COUNTRY_DATA.map((d, i) => (
                  <Marker
                    key={d.country}
                    position={[d.lat, d.lng]}
                    icon={createBubbleIcon(d.count, COUNTRY_COLORS[i])}
                  >
                    <LeafletTooltip direction="top" offset={[0, -8]} opacity={1}>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{d.country}</span>
                      <span style={{ fontSize: 10, marginLeft: 4, color: '#64748b' }}>{d.count} unidades</span>
                    </LeafletTooltip>
                  </Marker>
                ))}
              </MapContainer>
            </PanelCard>

            <PanelCard isDark={isDark} className="w-[200px] flex-none flex flex-col">
              <div className="px-3 pt-3 pb-0">
                <SectionLabel isDark={isDark}>Por país · {COUNTRY_DATA.length} países</SectionLabel>
              </div>
              <div className="flex items-center justify-center pt-1">
                <div className="relative">
                  <PieChart width={130} height={130}>
                    <Pie
                      data={COUNTRY_DATA}
                      dataKey="count"
                      nameKey="country"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {COUNTRY_DATA.map((_, i) => (
                        <Cell key={i} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={(p) => <ChartTip {...p} isDark={isDark} unit=" uds" />} />
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={cn('text-[16px] font-bold tabular-nums leading-none', textMain)}>
                      {COUNTRY_DATA.reduce((s, d) => s + d.count, 0)}
                    </span>
                    <span className={cn('text-[9px] mt-0.5', textMuted)}>uds.</span>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3 flex flex-col gap-1.5 overflow-y-auto">
                {[...COUNTRY_DATA]
                  .sort((a, b) => b.count - a.count)
                  .map((d, i) => {
                    const total = COUNTRY_DATA.reduce((s, x) => s + x.count, 0);
                    const pct   = Math.round(d.count / total * 100);
                    return (
                      <div key={d.country} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }} />
                        <span className={cn('text-[10.5px] flex-1 truncate', textSub)}>{d.country}</span>
                        <span className={cn('text-[10.5px] font-bold tabular-nums', textMain)}>{d.count}</span>
                        <span className={cn('text-[9px] w-7 text-right', textMuted)}>{pct}%</span>
                      </div>
                    );
                  })}
              </div>
            </PanelCard>
          </div>

          {/* ── Row 2: Charts ─────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4">

            <PanelCard isDark={isDark}>
              <div className="px-3 pt-3">
                <SectionLabel isDark={isDark}>Actividad últimas 24h · unidades</SectionLabel>
              </div>
              <div className="px-3 pb-3 pt-2">
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={HOURLY_DATA} margin={{ top: 12, right: 0, left: -28, bottom: 0 }}>
                    <XAxis dataKey="h" tick={chartAxis} interval={5} tickLine={false} axisLine={false} />
                    <YAxis tick={chartAxis} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      content={(p) => <ChartTip {...p} isDark={isDark} unit=" uds" />}
                      cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                    />
                    <Bar dataKey="v" fill="#6366f1" radius={[2, 2, 0, 0]} maxBarSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PanelCard>

            <PanelCard isDark={isDark}>
              <div className="px-3 pt-3">
                <SectionLabel isDark={isDark}>Unidades por tipo de vehículo</SectionLabel>
              </div>
              <div className="px-3 pb-3 pt-2">
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={byType} layout="vertical" margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
                    <XAxis type="number" tick={chartAxis} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={chartAxis} tickLine={false} axisLine={false} width={66} />
                    <RechartsTooltip
                      content={(p) => <ChartTip {...p} isDark={isDark} unit=" uds" />}
                      cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                    />
                    <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={10}>
                      {byType.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PanelCard>

            <PanelCard isDark={isDark}>
              <div className="px-3 pt-3">
                <SectionLabel isDark={isDark}>km recorridos · últimos 7 días</SectionLabel>
              </div>
              <div className="px-3 pb-3 pt-2">
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={KM_TREND} margin={{ top: 12, right: 0, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="kmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={chartAxis} tickLine={false} axisLine={false} />
                    <YAxis tick={chartAxis} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <RechartsTooltip
                      content={(p) => <ChartTip {...p} isDark={isDark} unit=" km" />}
                      cursor={{ stroke: isDark ? '#52525b' : '#e2e8f0', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="km" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#kmGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PanelCard>
          </div>

          {/* ── Row 3: Alarmas + Top km + Métricas + GPS ─────────── */}
          <div className="grid grid-cols-4 gap-4">

            <PanelCard isDark={isDark}>
              <div className="px-3 pt-3 pb-1.5">
                <SectionLabel isDark={isDark}>Alarmas recientes</SectionLabel>
              </div>
              <div className="pb-1">
                {RECENT_ALARMS.map((a, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <div>
                        <div className="text-[10px] font-semibold" style={{ color: a.color }}>{a.type}</div>
                        <div className={cn('text-[11px]', textSub)}>{a.plate}</div>
                      </div>
                      <span className={cn('text-[10px]', textMuted)}>{a.time}</span>
                    </div>
                    {i < RECENT_ALARMS.length - 1 && <Divider isDark={isDark} />}
                  </div>
                ))}
              </div>
            </PanelCard>

            <PanelCard isDark={isDark}>
              <div className="px-3 pt-3 pb-1.5">
                <SectionLabel isDark={isDark}>Top 6 · km recorridos</SectionLabel>
              </div>
              <div className="px-3 pb-3 flex flex-col gap-2.5 mt-1">
                {topKm.length === 0
                  ? <p className={cn('text-[11px] py-4 text-center', textMuted)}>Sin datos</p>
                  : topKm.map((v, i) => {
                    const km   = parseInt(v.odometer.replace(/\D/g, ''), 10) || 0;
                    const maxK = parseInt(topKm[0].odometer.replace(/\D/g, ''), 10) || 1;
                    return (
                      <div key={v.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn('text-[11px]', textSub)}>
                            <span className={cn('font-bold mr-1', textMuted)}>{i + 1}.</span>
                            {v.plate}
                          </span>
                          <span className={cn('text-[11px] font-bold tabular-nums', textMain)}>
                            {(km / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <MiniBar value={km} max={maxK} color="#8b5cf6" isDark={isDark} />
                      </div>
                    );
                  })}
              </div>
            </PanelCard>

            <PanelCard isDark={isDark}>
              <div className="px-3 pt-3 pb-1.5">
                <SectionLabel isDark={isDark}>Métricas operativas</SectionLabel>
              </div>
              <div className="pb-1">
                {[
                  { label: 'Vel. promedio activos', value: `${stats.avgSpeed} km/h`,          icon: Gauge,      color: '#3B82F6' },
                  { label: 'Disponibilidad flota',  value: stats.total > 0 ? `${Math.round((stats.active + stats.stopped) / stats.total * 100)}%` : '—', icon: Zap, color: '#10B981' },
                  { label: 'Tiempo en ruta prom.',  value: '3h 42m',                           icon: Clock,      color: '#F59E0B' },
                  { label: 'Activos / total',        value: `${stats.active}/${stats.total}`,  icon: Activity,   color: '#8B5CF6' },
                  { label: 'km recorridos hoy',     value: '10,200 km',                        icon: Route,      color: '#EF4444' },
                  { label: 'Alertas de velocidad',  value: `${stats.alarms} eventos`,          icon: TrendingUp, color: '#F97316' },
                ].map((m, i, arr) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label}>
                      <div className="flex items-center gap-2 px-3 py-1.5">
                        <Icon className="w-3 h-3 shrink-0" style={{ color: m.color }} strokeWidth={1.75} />
                        <span className={cn('text-[11px] flex-1 leading-tight', textSub)}>{m.label}</span>
                        <span className={cn('text-[11px] font-bold tabular-nums shrink-0', textMain)}>{m.value}</span>
                      </div>
                      {i < arr.length - 1 && <Divider isDark={isDark} />}
                    </div>
                  );
                })}
              </div>
            </PanelCard>

            <PanelCard isDark={isDark}>
              <div className="px-3 pt-3">
                <SectionLabel isDark={isDark}>Cobertura GPS · tipo de servicio</SectionLabel>
              </div>
              <div className="px-3 pb-3 pt-2">
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={GPS_SERVICES} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                    <XAxis type="number" tick={chartAxis} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="label" tick={chartAxis} tickLine={false} axisLine={false} width={80} />
                    <RechartsTooltip
                      content={(p) => <ChartTip {...p} isDark={isDark} unit=" dispositivos" />}
                      cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                    />
                    <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={10} fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
                <Divider isDark={isDark} />
                <div className="pt-2 flex flex-col gap-1.5">
                  {GPS_SERVICES.map(g => (
                    <div key={g.label} className="flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: g.color }} />
                        <span className={cn('text-[10px]', textMuted)}>{g.label}</span>
                      </div>
                      <span className={cn('text-[10px] font-semibold tabular-nums', textMain)}>{g.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PanelCard>
          </div>

        </div>
      </div>
    </div>
  );
}
