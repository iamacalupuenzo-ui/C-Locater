export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus   = 'active' | 'attending' | 'finished';
export type AlertType     = 'geocerca' | 'velocidad' | 'horario' | 'bateria' | 'panico' | 'sistema';

export interface Alert {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleAlias: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  description: string;
  timestamp: Date;
  attendedAt?: Date;
  finishedAt?: Date;
  requiresExplicitClose: boolean;
}

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  geocerca:  'Geocerca',
  velocidad: 'Exceso de velocidad',
  horario:   'Fuera de horario',
  bateria:   'Batería baja',
  panico:    'Botón de pánico',
  sistema:   'Error de sistema',
};

export const SEVERITY_COLORS: Record<AlertSeverity, { bg: string; text: string; border: string; badge: string }> = {
  critical: { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    badge: 'bg-red-500' },
  warning:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  badge: 'bg-amber-500' },
  info:     { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   badge: 'bg-blue-500' },
};

function uid(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function makeAlert(partial: Omit<Alert, 'id' | 'requiresExplicitClose'>): Alert {
  return {
    ...partial,
    id: uid(),
    requiresExplicitClose: partial.severity === 'critical',
  };
}

export const INITIAL_ALERTS: Alert[] = [
  makeAlert({
    vehicleId: '1', vehiclePlate: 'MOT-101', vehicleAlias: 'ANA',
    type: 'panico', severity: 'critical', status: 'active',
    description: 'Botón de pánico activado en ruta',
    timestamp: new Date(Date.now() - 2 * 60_000),
  }),
  makeAlert({
    vehicleId: '3', vehiclePlate: 'CAR-203', vehicleAlias: 'JUAN',
    type: 'velocidad', severity: 'warning', status: 'active',
    description: 'Velocidad: 98 km/h — límite 80 km/h',
    timestamp: new Date(Date.now() - 8 * 60_000),
  }),
  makeAlert({
    vehicleId: '5', vehiclePlate: 'TRK-305', vehicleAlias: 'CARLOS',
    type: 'geocerca', severity: 'warning', status: 'attending',
    description: 'Salida de zona autorizada: Miraflores',
    timestamp: new Date(Date.now() - 15 * 60_000),
    attendedAt: new Date(Date.now() - 12 * 60_000),
  }),
];

const MOCK_TYPES: AlertType[] = ['geocerca', 'velocidad', 'horario', 'bateria', 'panico', 'sistema'];
const MOCK_DESCRIPTIONS: Record<AlertType, string[]> = {
  geocerca:  ['Salida de zona autorizada', 'Entrada a zona restringida'],
  velocidad: ['Velocidad: 95 km/h — límite 80 km/h', 'Velocidad: 112 km/h — límite 90 km/h'],
  horario:   ['Operación fuera del horario asignado', 'Inicio de ruta antes del horario'],
  bateria:   ['Batería al 12 %', 'Batería al 8 % — crítico'],
  panico:    ['Botón de pánico activado en ruta', 'Alerta de pánico — sin respuesta'],
  sistema:   ['GPS sin señal por más de 10 min', 'Fallo de comunicación con unidad'],
};

export function generateRandomAlert(vehicles: { id: string; plate: string; name: string }[]): Alert {
  const vehicle  = vehicles[Math.floor(Math.random() * vehicles.length)];
  const type     = MOCK_TYPES[Math.floor(Math.random() * MOCK_TYPES.length)];
  const rand     = Math.random();
  const severity: AlertSeverity = rand < 0.25 ? 'critical' : rand < 0.65 ? 'warning' : 'info';
  const descs    = MOCK_DESCRIPTIONS[type];
  return makeAlert({
    vehicleId:    vehicle.id,
    vehiclePlate: vehicle.plate,
    vehicleAlias: vehicle.name,
    type,
    severity,
    status: 'active',
    description: descs[Math.floor(Math.random() * descs.length)],
    timestamp: new Date(),
  });
}
