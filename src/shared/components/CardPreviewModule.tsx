import { useState } from 'react';
import { FlaskConical, Clock } from 'lucide-react';
import type { Vehicle, GpsDevice, GpsServiceType, GpsReportStatus } from '../lib/data';
import type { UserRole } from '../lib/utils';
import { VehicleAccordionItem } from './fleet/VehicleAccordionItem';

function makeVehicle(overrides: { reportStatus: GpsReportStatus; label: string }): Vehicle {
  const base: Vehicle = {
    id: `preview-${overrides.label}`,
    name: 'DEMO',
    owner: 'Empresa Demo SAC',
    plate: 'ABC-123',
    engineCode: '2ZR-FE-001',
    type: 'car',
    status: 'active',
    position: [-12.0464, -77.0428],
    speed: '60 km/h',
    address: 'Av. Javier Prado Este 2100, San Isidro',
    coords: '-12.046400, -77.042800',
    direction: 'Norte',
    odometer: '12,450 KM',
    fuel: '72%',
    gpsCount: 1,
    alarmCount: 2,
    lastSeen: '05/05/2026 09:14:31 a.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823091234567',
        linea: '+51 987 654 321',
        group: 'Grupo Demo',
        subgroup: 'Flota Principal',
        reportStatus: overrides.reportStatus,
        ignition: 'on',
        speed: '60 km/h',
        fuel: '72%',
        alarmCount: 2,
        lastSeen: '05/05/2026 09:14:31 a.m.',
      } as GpsDevice,
    ],
  };
  return base;
}

const GPS_STATES: { reportStatus: GpsReportStatus; label: string; description: string; dot: string }[] = [
  { reportStatus: 'reporting',    label: 'Reportando',      description: 'GPS transmitiendo correctamente',    dot: 'bg-emerald-500' },
  { reportStatus: 'low-signal',   label: 'Señal baja',      description: 'GPS con señal débil — alerta',       dot: 'bg-orange-500'  },
  { reportStatus: 'no-signal',    label: 'Sin señal',        description: 'GPS sin señal — dejó de reportar',   dot: 'bg-orange-500'  },
  { reportStatus: 'disconnected', label: 'Desconectado',     description: 'GPS sin reporte por tiempo extendido', dot: 'bg-red-500'   },
];

const CHANGELOG = [
  {
    session: 'Sesión 7',
    date: '14 may 2026',
    changes: [
      'Color de ícono de vehículo por estado GPS del principal (verde / naranja / rojo / gris)',
      'Ignición y color de GPS son dimensiones independientes',
      'Placa sin guiones en la tarjeta',
      'Línea innecesaria entre ignición y ubicación eliminada',
      'Menú ⋮ para rol esad — reemplaza botón compartir',
    ],
  },
  {
    session: 'Sesión 6',
    date: '13 may 2026',
    changes: [
      'Capa GPS multi-posición en el mapa con polylines y markers individuales',
      'Clustering de vehículos por zoom (umbral dinámico)',
      'Card GPS expandida en el mapa — estados selectedGpsImei / expandedGpsImei separados',
      'Supresión de card de vehículo cuando tiene 2+ GPS activos',
    ],
  },
  {
    session: 'Sesión 5',
    date: '12 may 2026',
    changes: [
      'Arquitectura de información de tarjeta GPS (4 filas definidas)',
      'Badge de jerarquía Principal / Secundario / Respaldo',
      'IMEI + LÍNEA en dos columnas con hover copiable',
      'Ícono LocateFixed eliminado para ganar espacio horizontal',
    ],
  },
  {
    session: 'Sesión 4',
    date: '11 may 2026',
    changes: [
      'Nomenclatura SVR (Básico / Plus / Contingencia / X)',
      'Menú ⋮ GPS — Copiar información con texto plano',
      'SharePopover con historial de compartidos',
      'Roles renombrados a Administrador / Concesionaria / Cliente Directo',
    ],
  },
];

export function CardPreviewModule() {
  const [expandedId, setExpandedId] = useState<string | null>('preview-Reportando');
  const [previewRole, setPreviewRole] = useState<UserRole>('admin');
  const [toast, setToast] = useState<string | null>(null);

  const roles: { id: UserRole; label: string }[] = [
    { id: 'admin',    label: 'Admin'    },
    { id: 'esad',     label: 'Esad'     },
    { id: 'operator', label: 'Operador' },
    { id: 'client',   label: 'Cliente'  },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F5F5F7] px-6 py-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
          <FlaskConical className="w-4.5 h-4.5 text-brand" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-[16px] font-bold text-slate-900 leading-none">Preview — Tarjeta de vehículo</h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Estados GPS · Historial de cambios de diseño</p>
        </div>
      </div>

      {/* Selector de rol */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rol:</span>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => setPreviewRole(r.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                previewRole === r.id ? 'bg-brand text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de cards por estado GPS */}
      <div className="grid grid-cols-2 gap-4">
        {GPS_STATES.map(state => {
          const vehicle = makeVehicle(state);
          const isExpanded = expandedId === vehicle.id;
          return (
            <div key={state.reportStatus} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state.dot}`} />
                <span className="text-[11px] font-bold text-slate-700">{state.label}</span>
                <span className="text-[10px] text-slate-400">— {state.description}</span>
              </div>
              <VehicleAccordionItem
                vehicle={vehicle}
                isExpanded={isExpanded}
                onToggle={() => setExpandedId(isExpanded ? null : vehicle.id)}
                onFlyTo={() => {}}
                onShowToast={(msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); }}
                userRole={previewRole}
                profile="c-go"
              />
            </div>
          );
        })}
      </div>

      {/* Historial de cambios */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Historial de iteraciones</span>
        </div>
        <div className="flex flex-col gap-3">
          {CHANGELOG.map((entry, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-slate-900">{entry.session}</span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{entry.date}</span>
              </div>
              <ul className="flex flex-col gap-1">
                {entry.changes.map((c, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-[11.5px] text-slate-600">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[12px] font-medium px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
