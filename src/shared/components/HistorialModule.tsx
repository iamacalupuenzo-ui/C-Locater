import { useState } from 'react';
import { History, Clock, Tag, FlaskConical, Filter, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChangeEntry {
  session: string;
  date: string;
  changes: { text: string; component: string; profile?: string; role?: string }[];
}

const HISTORIAL: ChangeEntry[] = [
  {
    session: 'Sesión 7',
    date: '14 may 2026',
    changes: [
      { text: 'Color de ícono de vehículo por estado GPS del principal (verde / naranja / rojo / gris)', component: 'FleetMap', profile: 'c-go' },
      { text: 'Ignición y color de GPS son dimensiones independientes', component: 'FleetMap', profile: 'c-go' },
      { text: 'Placa sin guiones en la tarjeta', component: 'VehicleAccordionItem', profile: 'c-go' },
      { text: 'Línea innecesaria entre ignición y ubicación eliminada', component: 'GpsPopover', profile: 'c-go' },
      { text: 'Menú ⋮ para rol esad — reemplaza botón compartir', component: 'GpsActionMenu', role: 'esad' },
    ],
  },
  {
    session: 'Sesión 6',
    date: '13 may 2026',
    changes: [
      { text: 'Capa GPS multi-posición en el mapa con polylines y markers individuales', component: 'FleetMap' },
      { text: 'Spiderfication de GPS cercanos con badge y líneas punteadas', component: 'FleetMap' },
      { text: 'GPS Highlight desde GpsPopover con animación pulsante', component: 'FleetMap' },
      { text: 'Auto-fit de bounds al seleccionar vehículo con 2+ GPS', component: 'FleetMap' },
      { text: 'GpsDevice.position — datos de posición por dispositivo GPS', component: 'data' },
    ],
  },
  {
    session: 'Sesión 5',
    date: '12 may 2026',
    changes: [
      { text: 'Arquitectura de información de tarjeta GPS (4 filas definidas)', component: 'GpsPopover' },
      { text: 'Badge de jerarquía Principal / Secundario / Respaldo', component: 'GpsPopover' },
      { text: 'Color violeta para SVR Contingencia', component: 'GpsPopover' },
      { text: 'IMEI + LÍNEA en dos columnas con hover copiable', component: 'GpsPopover' },
      { text: 'Ícono LocateFixed eliminado para ganar espacio horizontal', component: 'GpsPopover' },
      { text: 'Distinción Secundario vs Respaldo (contrato vs emergencia)', component: 'GpsPopover' },
      { text: 'Tooltips en métricas al hover (card vehículo y GPS)', component: 'VehicleAccordionItem' },
    ],
  },
  {
    session: 'Sesión 4',
    date: '11 may 2026',
    changes: [
      { text: 'Nomenclatura SVR (Básico / Plus / Contingencia / X)', component: 'GpsPopover' },
      { text: 'Menú ⋮ GPS — Copiar información con texto plano', component: 'GpsActionMenu' },
      { text: 'SharePopover con historial de compartidos', component: 'SharePopover' },
      { text: 'Roles renombrados a Administrador / Concesionaria / Cliente Directo', component: 'UserMenu' },
    ],
  },
  {
    session: 'Sesión 3',
    date: '10 may 2026',
    changes: [
      { text: 'CardPreviewModule — vista de preview de tarjeta de vehículo', component: 'CardPreviewModule', role: 'developer' },
      { text: 'Selector de roles en CardPreviewModule para test visual', component: 'CardPreviewModule', role: 'developer' },
    ],
  },
  {
    session: 'Sesión 2',
    date: '9 may 2026',
    changes: [
      { text: 'Matriz de visibilidad por rol en FloatingStats', component: 'FloatingStats' },
      { text: 'Zona 3 del acordeón: acciones dinámicas por rol', component: 'VehicleAccordionItem' },
      { text: 'Vista colapsada: admin ve fecha, operator/client ve velocidad', component: 'VehicleAccordionItem' },
      { text: 'Badge de estado del vehículo: Ignition ON/OFF (C-Go) vs Encendido/Apagado (C-Loc)', component: 'FloatingStats' },
      { text: 'Filtro SVR Contingencia para operator C-Go', component: 'GpsPopover', profile: 'c-go' },
      { text: 'Métricas expandidas por rol en GPS Popover', component: 'GpsPopover' },
    ],
  },
  {
    session: 'Sesión 1',
    date: '8 may 2026',
    changes: [
      { text: 'Estructura base del proyecto: C-Go y C-Loc como perfiles', component: 'App' },
      { text: 'Headers y Sidebars por perfil con layouts diferenciados', component: 'Layout' },
      { text: 'UserMenu con switcher de perfil y rol', component: 'UserMenu' },
      { text: 'FleetMap con Leaflet y CartoDB Voyager', component: 'FleetMap' },
      { text: 'FloatingStats con StatCards y acordeón de vehículos', component: 'FloatingStats' },
      { text: 'CaminosModule — tabla de rutas con filtros', component: 'CaminosModule' },
      { text: 'Sistema de roles admin / operator / client', component: 'UserMenu' },
      { text: 'CustomEvents para comunicación FleetMap ↔ FloatingStats', component: 'FleetMap' },
    ],
  },
];

const ALL_COMPONENTS = Array.from(new Set(HISTORIAL.flatMap(e => e.changes.map(c => c.component)))).sort();

export function HistorialModule() {
  const [filterComponent, setFilterComponent] = useState<string | null>(null);

  const filtered = filterComponent
    ? HISTORIAL.map(entry => ({
        ...entry,
        changes: entry.changes.filter(c => c.component === filterComponent),
      })).filter(entry => entry.changes.length > 0)
    : HISTORIAL;

  return (
    <div className="h-full overflow-y-auto bg-[#F5F5F7] px-6 py-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <History className="w-4.5 h-4.5 text-violet-500" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-[16px] font-bold text-slate-900 leading-none">Historial de cambios</h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {HISTORIAL.length} sesiones — {HISTORIAL.reduce((a, e) => a + e.changes.length, 0)} cambios registrados
          </p>
        </div>
      </div>

      {/* Filtro por componente */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-slate-400" strokeWidth={1.75} />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Filtrar por componente</span>
          {filterComponent && (
            <button
              onClick={() => setFilterComponent(null)}
              className="flex items-center gap-1 text-[10px] font-medium text-violet-500 hover:text-violet-700 transition-colors ml-auto"
            >
              <X className="w-2.5 h-2.5" strokeWidth={2} />
              Limpiar
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_COMPONENTS.map(comp => (
            <button
              key={comp}
              onClick={() => setFilterComponent(filterComponent === comp ? null : comp)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors border',
                filterComponent === comp
                  ? 'bg-violet-500 text-white border-violet-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
              )}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-3">
        {filtered.map((entry, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
            {/* Session header */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-slate-900">{entry.session}</span>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{entry.date}</span>
              <span className="text-[10px] font-medium text-slate-300 ml-auto">{entry.changes.length} cambio{entry.changes.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Changes list */}
            <ul className="flex flex-col gap-1">
              {entry.changes.map((c, j) => (
                <li key={j} className="flex items-start gap-1.5 text-[11.5px] text-slate-600">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                  <span className="flex-1">{c.text}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Tag className="w-2.5 h-2.5 text-slate-300" strokeWidth={2} />
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{c.component}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
