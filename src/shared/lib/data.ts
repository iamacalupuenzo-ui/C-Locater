export type GpsServiceType = 'basico' | 'flotas' | 'contingencia' | 'svr-x';

export type GpsReportStatus = 'reporting' | 'no-signal' | 'low-signal' | 'disconnected';

export type GpsGroup = { name: string; subgroup?: string };

export type GpsDevice = {
  type: GpsServiceType;
  imei: string;
  linea: string;
  groups?: GpsGroup[];
  reportStatus: GpsReportStatus;
  ignition: 'on' | 'off';
  speed: string;
  fuel: string;
  alarmCount: number;
  lastSeen: string;
  position?: [number, number];
};

export type Vehicle = {
  id: string;
  name: string;
  owner: string;
  plate: string;
  engineCode: string;
  type: string;
  status: 'active' | 'stopped' | 'offline';
  position: [number, number];
  speed: string;
  address: string;
  coords: string;
  direction: string;
  odometer: string;
  fuel: string;
  gpsCount?: number;
  alarmCount?: number;
  lastSeen: string;
  gpsDevices?: GpsDevice[];
};

export const FLEET_DATA: Vehicle[] = [
  {
    id: '1',
    name: 'ANA',
    owner: 'Logística Express SAC',
    plate: 'MOT-101',
    engineCode: 'YS-125-001',
    type: 'motorcycle',
    status: 'active',
    position: [-12.0450, -77.0400] as [number, number],
    speed: '45 km/h',
    address: 'Av. Universitaria 3206 Urb, Los Olivos 15302',
    coords: '-11.999089, -77.082595',
    direction: 'Sur-Este',
    odometer: '12,450 KM',
    fuel: '85%',
    gpsCount: 2,
    alarmCount: 3,
    lastSeen: '05/05/2026 09:14:31 a.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823091234567',
        linea: '+51 987 654 321',
        groups: [{ name: 'Santander Autos', subgroup: 'Flota Lima Norte' }],
        reportStatus: 'no-signal' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '85%',
        alarmCount: 3,
        lastSeen: '02/05/2026 10:00:12 a.m.',
        position: [-12.0450, -77.0400] as [number, number],
      },
      {
        type: 'contingencia' as GpsServiceType,
        imei: '490012378000101',
        linea: '+51 912 000 101',
        groups: [{ name: 'Santander Autos', subgroup: 'Flota Lima Norte' }],
        reportStatus: 'reporting' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '79%',
        alarmCount: 0,
        lastSeen: '05/05/2026 05:15:47 p.m.',
        position: [-12.0350, -77.0280] as [number, number],
      },
    ] as GpsDevice[],
  },
  {
    id: '2',
    name: 'MARCO',
    owner: 'Distribuidora Lima Norte SRL',
    plate: 'ABC-123',
    engineCode: 'K24A2-002',
    type: 'car',
    status: 'active',
    position: [-12.0480, -77.0430] as [number, number],
    speed: '60 km/h',
    address: 'Panamericana Norte Km 15, Independencia',
    coords: '-12.001200, -77.070000',
    direction: 'Norte',
    odometer: '1,250 KM',
    fuel: '80%',
    gpsCount: 1,
    alarmCount: 0,
    lastSeen: '05/05/2026 08:52:08 a.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823090000202',
        linea: '+51 987 000 202',
        groups: [{ name: 'Santander Autos', subgroup: 'Distribución Lima' }],
        reportStatus: 'reporting' as const,
        ignition: 'on' as const,
        speed: '60 km/h',
        fuel: '80%',
        alarmCount: 0,
        lastSeen: '05/05/2026 08:52:08 a.m.',
      },
    ] as GpsDevice[],
  },
  {
    id: '3',
    name: 'JUAN',
    owner: 'Transportes Callao SAC',
    plate: 'TRK-456',
    engineCode: 'D4D-2.5-003',
    type: 'truck',
    status: 'stopped',
    position: [-12.0490, -77.0480] as [number, number],
    speed: '0 km/h',
    address: 'Av. Argentina 1400, Callao',
    coords: '-12.050000, -77.100000',
    direction: 'Oeste',
    odometer: '4,500 KM',
    fuel: '20%',
    gpsCount: 4,
    alarmCount: 7,
    lastSeen: '05/05/2026 07:30:55 a.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823097654321',
        linea: '+51 976 000 303',
        groups: [{ name: 'BCP Leasing', subgroup: 'Unidad Pesada' }],
        reportStatus: 'reporting' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '20%',
        alarmCount: 5,
        lastSeen: '05/05/2026 07:30:55 a.m.',
        position: [-12.0490, -77.0480] as [number, number],
      },
      {
        type: 'basico' as GpsServiceType,
        imei: '490012370000303',
        linea: '+51 976 100 303',
        groups: [{ name: 'BCP Leasing', subgroup: 'Unidad Pesada' }],
        reportStatus: 'reporting' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '18%',
        alarmCount: 2,
        lastSeen: '05/05/2026 07:28:19 a.m.',
        position: [-12.0510, -77.0495] as [number, number],
      },
      {
        type: 'contingencia' as GpsServiceType,
        imei: '490012370000304',
        linea: '+51 976 432 100',
        groups: [{ name: 'BCP Leasing', subgroup: 'Unidad Pesada' }],
        reportStatus: 'disconnected' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '0%',
        alarmCount: 0,
        lastSeen: '04/05/2026 11:22:05 p.m.',
        position: [-12.0475, -77.0510] as [number, number],
      },
      {
        type: 'svr-x' as GpsServiceType,
        imei: '490012378654001',
        linea: '+51 976 200 303',
        groups: [
          { name: 'BCP Leasing', subgroup: 'Piloto SVR X' },
          { name: 'Santander Autos', subgroup: 'Flota Lima Norte' },
          { name: 'Consorcio Vial Perú' },
        ],
        reportStatus: 'reporting' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '55%',
        alarmCount: 0,
        lastSeen: '05/05/2026 06:45:30 a.m.',
        position: [-12.0520, -77.0460] as [number, number],
      },
    ] as GpsDevice[],
  },
  {
    id: '4',
    name: 'SARA',
    owner: 'Minera Perú Holdings SA',
    plate: 'CAT-789',
    engineCode: 'ISB6.7-004',
    type: 'truck',
    status: 'offline',
    position: [-12.0440, -77.0380] as [number, number],
    speed: '0 km/h',
    address: 'Base Central Lima, Cercado',
    coords: '-12.040000, -77.035000',
    direction: '-',
    odometer: '8,100 KM',
    fuel: '0%',
    gpsCount: 1,
    alarmCount: 12,
    lastSeen: '04/05/2026 06:18:44 p.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823090000404',
        linea: '+51 954 000 404',
        groups: [{ name: 'Caja Cusco', subgroup: 'Flota Minera' }],
        reportStatus: 'disconnected' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '0%',
        alarmCount: 12,
        lastSeen: '04/05/2026 06:18:44 p.m.',
      },
    ] as GpsDevice[],
  },
  {
    id: '5',
    name: 'CARLOS',
    owner: 'Repartos San Borja EIRL',
    plate: 'XYZ-100',
    engineCode: '2ZR-FE-005',
    type: 'car',
    status: 'active',
    position: [-12.0510, -77.0390] as [number, number],
    speed: '30 km/h',
    address: 'Av. Javier Prado Este 2100, San Borja',
    coords: '-12.080000, -77.020000',
    direction: 'Sur',
    odometer: '3,200 KM',
    fuel: '65%',
    gpsCount: 1,
    alarmCount: 1,
    lastSeen: '05/05/2026 09:01:22 a.m.',
    gpsDevices: [
      {
        type: 'basico' as GpsServiceType,
        imei: '354823090000505',
        linea: '+51 987 000 505',
        groups: [{ name: 'BCP Leasing', subgroup: 'Reparto Sur' }],
        reportStatus: 'reporting' as const,
        ignition: 'on' as const,
        speed: '30 km/h',
        fuel: '65%',
        alarmCount: 1,
        lastSeen: '05/05/2026 09:01:22 a.m.',
      },
    ] as GpsDevice[],
  },
  {
    id: '6',
    name: 'LUIS',
    owner: 'Delivery Miraflores SAC',
    plate: 'MOT-552',
    engineCode: 'PCX-160-006',
    type: 'motorcycle',
    status: 'active',
    position: [-12.0530, -77.0420] as [number, number],
    speed: '40 km/h',
    address: 'Ovalo Miraflores, Miraflores',
    coords: '-12.120000, -77.030000',
    direction: 'Sur-Oeste',
    odometer: '900 KM',
    fuel: '90%',
    gpsCount: 1,
    alarmCount: 0,
    lastSeen: '05/05/2026 09:10:07 a.m.',
    gpsDevices: [
      {
        type: 'basico' as GpsServiceType,
        imei: '354823090000606',
        linea: '+51 987 000 606',
        groups: [{ name: 'BBVA Perú', subgroup: 'Delivery Miraflores' }],
        reportStatus: 'reporting' as const,
        ignition: 'on' as const,
        speed: '40 km/h',
        fuel: '90%',
        alarmCount: 0,
        lastSeen: '05/05/2026 09:10:07 a.m.',
      },
    ] as GpsDevice[],
  },
  {
    id: '7',
    name: 'FLOTA-X',
    owner: 'Grupo Transporte Comas SA',
    plate: 'BUS-999',
    engineCode: 'ISB230-007',
    type: 'bus',
    status: 'active',
    position: [-12.0460, -77.0460] as [number, number],
    speed: '55 km/h',
    address: 'Av. Túpac Amaru 2800, Comas',
    coords: '-12.046000, -77.046000',
    direction: 'Norte',
    odometer: '22,800 KM',
    fuel: '72%',
    gpsCount: 5,
    alarmCount: 2,
    lastSeen: '05/05/2026 09:08:14 a.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823090011223',
        linea: '+51 954 001 701',
        groups: [{ name: 'Caja Cusco', subgroup: 'Bus Metropolitano' }],
        reportStatus: 'reporting' as const,
        ignition: 'on' as const,
        speed: '55 km/h',
        fuel: '72%',
        alarmCount: 2,
        lastSeen: '05/05/2026 09:08:14 a.m.',
        position: [-12.0460, -77.0460] as [number, number],
      },
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823090044556',
        linea: '+51 954 001 702',
        groups: [{ name: 'Caja Cusco', subgroup: 'Bus Metropolitano' }],
        reportStatus: 'reporting' as const,
        ignition: 'on' as const,
        speed: '54 km/h',
        fuel: '70%',
        alarmCount: 1,
        lastSeen: '05/05/2026 09:07:58 a.m.',
        position: [-12.0461, -77.0461] as [number, number],
      },
      {
        type: 'basico' as GpsServiceType,
        imei: '490012370000711',
        linea: '+51 954 001 703',
        groups: [{ name: 'Caja Cusco', subgroup: 'Bus Auxiliar' }],
        reportStatus: 'low-signal' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '55%',
        alarmCount: 0,
        lastSeen: '05/05/2026 08:30:00 a.m.',
        position: [-12.0480, -77.0445] as [number, number],
      },
      {
        type: 'basico' as GpsServiceType,
        imei: '490012370000712',
        linea: '+51 954 001 704',
        groups: [{ name: 'Caja Cusco', subgroup: 'Bus Auxiliar' }],
        reportStatus: 'reporting' as const,
        ignition: 'on' as const,
        speed: '52 km/h',
        fuel: '68%',
        alarmCount: 0,
        lastSeen: '05/05/2026 09:06:33 a.m.',
        position: [-12.0445, -77.0478] as [number, number],
      },
      {
        type: 'contingencia' as GpsServiceType,
        imei: '490012370000713',
        linea: '+51 954 321 678',
        groups: [{ name: 'Caja Cusco', subgroup: 'Bus Metropolitano' }],
        reportStatus: 'no-signal' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '10%',
        alarmCount: 0,
        lastSeen: '05/05/2026 07:00:41 a.m.',
        position: [-12.0500, -77.0498] as [number, number],
      },
    ] as GpsDevice[],
  },
  {
    id: '8',
    name: 'ROSA',
    owner: 'Financiera Confianza SAC',
    plate: 'MOT-338',
    engineCode: 'PCX150-008',
    type: 'motorcycle',
    status: 'active' as const,
    position: [-12.0520, -77.0350] as [number, number],
    speed: '28 km/h',
    address: 'Av. Universitaria 1800, San Martín de Porres',
    coords: '-12.052000, -77.035000',
    direction: 'Norte',
    odometer: '3,100 KM',
    fuel: '55%',
    gpsCount: 1,
    alarmCount: 0,
    lastSeen: '05/05/2026 08:45:10 a.m.',
    gpsDevices: [
      {
        type: 'basico' as GpsServiceType,
        imei: '354823090000808',
        linea: '+51 987 000 808',
        groups: [{ name: 'Financiera Confianza', subgroup: 'Flota Norte' }],
        reportStatus: 'no-signal' as const,
        ignition: 'on' as const,
        speed: '28 km/h',
        fuel: '55%',
        alarmCount: 0,
        lastSeen: '05/05/2026 08:45:10 a.m.',
      },
    ] as GpsDevice[],
  },
  {
    id: '9',
    name: 'DIEGO',
    owner: 'Transportes Rápidos del Sur SAC',
    plate: 'TRK-221',
    engineCode: 'ISB6.7-009',
    type: 'truck',
    status: 'stopped' as const,
    position: [-12.0400, -77.0500] as [number, number],
    speed: '0 km/h',
    address: 'Av. Colonial 2400, Breña',
    coords: '-12.040000, -77.050000',
    direction: '-',
    odometer: '67,800 KM',
    fuel: '30%',
    gpsCount: 2,
    alarmCount: 4,
    lastSeen: '05/05/2026 07:55:33 a.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823090000909',
        linea: '+51 954 000 909',
        groups: [{ name: 'Banco Pichincha', subgroup: 'Flota Sur' }],
        reportStatus: 'low-signal' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '30%',
        alarmCount: 4,
        lastSeen: '05/05/2026 07:55:33 a.m.',
      },
      {
        type: 'contingencia' as GpsServiceType,
        imei: '490012370000909',
        linea: '+51 954 100 909',
        groups: [{ name: 'Banco Pichincha', subgroup: 'Flota Sur' }],
        reportStatus: 'reporting' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '28%',
        alarmCount: 0,
        lastSeen: '05/05/2026 07:58:01 a.m.',
      },
    ] as GpsDevice[],
  },
  {
    id: '10',
    name: 'ELENA',
    owner: 'Inversiones Villa María SAC',
    plate: '',
    engineCode: 'D4D2500DIESEL10',
    type: 'car',
    status: 'offline' as const,
    position: [-12.0470, -77.0350] as [number, number],
    speed: '0 km/h',
    address: 'Jr. Lampa 480, Cercado de Lima',
    coords: '-12.047000, -77.035000',
    direction: '-',
    odometer: '22,450 KM',
    fuel: '10%',
    gpsCount: 1,
    alarmCount: 6,
    lastSeen: '03/05/2026 04:22:18 p.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823091010101',
        linea: '+51 987 010 101',
        groups: [{ name: 'Villa María Leasing', subgroup: 'Flota Centro' }],
        reportStatus: 'disconnected' as const,
        ignition: 'off' as const,
        speed: '0 km/h',
        fuel: '10%',
        alarmCount: 6,
        lastSeen: '03/05/2026 04:22:18 p.m.',
      },
    ] as GpsDevice[],
  },
  {
    id: '11',
    name: 'RUTA-7',
    owner: 'Consorcio Vial Perú SA',
    plate: 'BUS-447',
    engineCode: 'ISB230-011',
    type: 'bus',
    status: 'active' as const,
    position: [-12.0560, -77.0470] as [number, number],
    speed: '42 km/h',
    address: 'Av. Abancay 600, Cercado de Lima',
    coords: '-12.056000, -77.047000',
    direction: 'Sur',
    odometer: '118,300 KM',
    fuel: '60%',
    gpsCount: 1,
    alarmCount: 1,
    lastSeen: '05/05/2026 09:12:55 a.m.',
    gpsDevices: [
      {
        type: 'flotas' as GpsServiceType,
        imei: '354823091111111',
        linea: '+51 954 111 111',
        groups: [{ name: 'Consorcio Vial', subgroup: 'Bus Troncal' }],
        reportStatus: 'reporting' as const,
        ignition: 'on' as const,
        speed: '42 km/h',
        fuel: '60%',
        alarmCount: 1,
        lastSeen: '05/05/2026 09:12:55 a.m.',
      },
    ] as GpsDevice[],
  },

  // ── AREQUIPA ────────────────────────────────────────────────────────────────
  { id: '12', name: 'PEDRO', owner: 'Transportes del Sur SAC', plate: 'ARQ-101', engineCode: 'D4D-AQ-012', type: 'truck', status: 'active' as const, position: [-16.3980, -71.5310] as [number, number], speed: '55 km/h', address: 'Av. Ejército 800, Arequipa', coords: '-16.398000, -71.531000', direction: 'Norte', odometer: '34,200 KM', fuel: '70%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:05:11 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200012', linea: '+51 954 012 001', groups: [{ name: 'Transportes del Sur', subgroup: 'Flota Arequipa' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '55 km/h', fuel: '70%', alarmCount: 0, lastSeen: '05/05/2026 09:05:11 a.m.' }] as GpsDevice[] },
  { id: '13', name: 'ALICIA', owner: 'Distribuidora Arequipa EIRL', plate: 'ARQ-202', engineCode: '2NZ-AQ-013', type: 'car', status: 'active' as const, position: [-16.4120, -71.5420] as [number, number], speed: '38 km/h', address: 'Av. La Marina 1200, Arequipa', coords: '-16.412000, -71.542000', direction: 'Sur-Este', odometer: '8,760 KM', fuel: '55%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 08:48:30 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200013', linea: '+51 954 012 002', groups: [{ name: 'Distribuidora Arequipa', subgroup: 'Reparto' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '38 km/h', fuel: '55%', alarmCount: 1, lastSeen: '05/05/2026 08:48:30 a.m.' }] as GpsDevice[] },
  { id: '14', name: 'FELIX', owner: 'Minera Sur Andina SA', plate: 'ARQ-303', engineCode: 'ISB-AQ-014', type: 'truck', status: 'stopped' as const, position: [-16.4050, -71.5250] as [number, number], speed: '0 km/h', address: 'Av. Parra 540, Arequipa', coords: '-16.405000, -71.525000', direction: '-', odometer: '98,400 KM', fuel: '25%', gpsCount: 2, alarmCount: 3, lastSeen: '05/05/2026 07:20:15 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200014', linea: '+51 954 012 003', groups: [{ name: 'Minera Sur Andina', subgroup: 'Flota Pesada' }], reportStatus: 'reporting' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '25%', alarmCount: 3, lastSeen: '05/05/2026 07:20:15 a.m.' }] as GpsDevice[] },
  { id: '15', name: 'MILAGROS', owner: 'Courier Arequipa SAC', plate: 'MOT-601', engineCode: 'PCX-AQ-015', type: 'motorcycle', status: 'active' as const, position: [-16.4010, -71.5380] as [number, number], speed: '32 km/h', address: 'Calle Mercaderes 210, Arequipa', coords: '-16.401000, -71.538000', direction: 'Oeste', odometer: '5,100 KM', fuel: '80%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:14:02 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200015', linea: '+51 954 012 004', groups: [{ name: 'Courier Arequipa', subgroup: 'Delivery' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '32 km/h', fuel: '80%', alarmCount: 0, lastSeen: '05/05/2026 09:14:02 a.m.' }] as GpsDevice[] },
  { id: '16', name: 'RUTA-AQ1', owner: 'Transportes Urbanos Arequipa SA', plate: 'BUS-301', engineCode: 'ISB-AQ-016', type: 'bus', status: 'active' as const, position: [-16.4200, -71.5300] as [number, number], speed: '45 km/h', address: 'Av. Independencia 1800, Arequipa', coords: '-16.420000, -71.530000', direction: 'Norte', odometer: '210,500 KM', fuel: '62%', gpsCount: 1, alarmCount: 2, lastSeen: '05/05/2026 09:10:44 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200016', linea: '+51 954 012 005', groups: [{ name: 'Transportes Urbanos AQP', subgroup: 'Bus Troncal' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '45 km/h', fuel: '62%', alarmCount: 2, lastSeen: '05/05/2026 09:10:44 a.m.' }] as GpsDevice[] },
  { id: '17', name: 'ERNESTO', owner: 'Logística Volcán EIRL', plate: 'ARQ-404', engineCode: 'K24A-AQ-017', type: 'car', status: 'offline' as const, position: [-16.3950, -71.5480] as [number, number], speed: '0 km/h', address: 'Av. Cayma 340, Arequipa', coords: '-16.395000, -71.548000', direction: '-', odometer: '41,300 KM', fuel: '5%', gpsCount: 1, alarmCount: 8, lastSeen: '03/05/2026 02:10:00 p.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200017', linea: '+51 954 012 006', groups: [{ name: 'Logística Volcán', subgroup: 'Flota Centro' }], reportStatus: 'disconnected' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '5%', alarmCount: 8, lastSeen: '03/05/2026 02:10:00 p.m.' }] as GpsDevice[] },
  { id: '18', name: 'BEATRIZ', owner: 'Reparto Yanahuara SAC', plate: 'MOT-602', engineCode: 'YS-AQ-018', type: 'motorcycle', status: 'active' as const, position: [-16.3880, -71.5560] as [number, number], speed: '27 km/h', address: 'Av. Ejército 120, Yanahuara, Arequipa', coords: '-16.388000, -71.556000', direction: 'Sur', odometer: '2,800 KM', fuel: '88%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:13:55 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200018', linea: '+51 954 012 007', groups: [{ name: 'Reparto Yanahuara', subgroup: 'Zona Norte' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '27 km/h', fuel: '88%', alarmCount: 0, lastSeen: '05/05/2026 09:13:55 a.m.' }] as GpsDevice[] },
  { id: '19', name: 'VICTOR', owner: 'Carga Pesada Sur SA', plate: 'ARQ-505', engineCode: 'ISX-AQ-019', type: 'truck', status: 'stopped' as const, position: [-16.4280, -71.5200] as [number, number], speed: '0 km/h', address: 'Av. Andrés Avelino Cáceres 900, Arequipa', coords: '-16.428000, -71.520000', direction: '-', odometer: '156,700 KM', fuel: '40%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 06:55:20 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200019', linea: '+51 954 012 008', groups: [{ name: 'Carga Pesada Sur', subgroup: 'Flota Arequipa' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '40%', alarmCount: 1, lastSeen: '05/05/2026 06:55:20 a.m.' }] as GpsDevice[] },

  // ── CUSCO ───────────────────────────────────────────────────────────────────
  { id: '20', name: 'WILMER', owner: 'Transportes Inca SAC', plate: 'CUS-101', engineCode: 'D4D-CU-020', type: 'truck', status: 'active' as const, position: [-13.5250, -71.9720] as [number, number], speed: '40 km/h', address: 'Av. El Sol 800, Cusco', coords: '-13.525000, -71.972000', direction: 'Este', odometer: '52,100 KM', fuel: '65%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:03:18 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200020', linea: '+51 984 020 001', groups: [{ name: 'Transportes Inca', subgroup: 'Flota Cusco' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '40 km/h', fuel: '65%', alarmCount: 0, lastSeen: '05/05/2026 09:03:18 a.m.' }] as GpsDevice[] },
  { id: '21', name: 'CARMEN', owner: 'Distribuidora Cusco EIRL', plate: 'CUS-202', engineCode: '2NZ-CU-021', type: 'car', status: 'active' as const, position: [-13.5380, -71.9600] as [number, number], speed: '30 km/h', address: 'Av. Huáscar 450, Cusco', coords: '-13.538000, -71.960000', direction: 'Norte', odometer: '11,400 KM', fuel: '72%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:11:40 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200021', linea: '+51 984 020 002', groups: [{ name: 'Distribuidora Cusco', subgroup: 'Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '30 km/h', fuel: '72%', alarmCount: 0, lastSeen: '05/05/2026 09:11:40 a.m.' }] as GpsDevice[] },
  { id: '22', name: 'RUTA-CU1', owner: 'Bus Andino Cusco SA', plate: 'BUS-501', engineCode: 'ISB-CU-022', type: 'bus', status: 'active' as const, position: [-13.5190, -71.9800] as [number, number], speed: '35 km/h', address: 'Av. Tullumayo 200, Cusco', coords: '-13.519000, -71.980000', direction: 'Sur', odometer: '88,700 KM', fuel: '50%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 09:08:55 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200022', linea: '+51 984 020 003', groups: [{ name: 'Bus Andino Cusco', subgroup: 'Línea Sur' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '35 km/h', fuel: '50%', alarmCount: 1, lastSeen: '05/05/2026 09:08:55 a.m.' }] as GpsDevice[] },
  { id: '23', name: 'MARISOL', owner: 'Courier Cusco SAC', plate: 'MOT-701', engineCode: 'PCX-CU-023', type: 'motorcycle', status: 'active' as const, position: [-13.5310, -71.9650] as [number, number], speed: '22 km/h', address: 'Calle Plateros 120, Cusco', coords: '-13.531000, -71.965000', direction: 'Oeste', odometer: '3,200 KM', fuel: '91%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:15:01 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200023', linea: '+51 984 020 004', groups: [{ name: 'Courier Cusco', subgroup: 'Delivery Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '22 km/h', fuel: '91%', alarmCount: 0, lastSeen: '05/05/2026 09:15:01 a.m.' }] as GpsDevice[] },
  { id: '24', name: 'RODRIGO', owner: 'Minera Andahuaylilas SA', plate: 'CUS-303', engineCode: 'ISX-CU-024', type: 'truck', status: 'stopped' as const, position: [-13.5450, -71.9750] as [number, number], speed: '0 km/h', address: 'Av. Collasuyo 1100, Cusco', coords: '-13.545000, -71.975000', direction: '-', odometer: '74,300 KM', fuel: '35%', gpsCount: 1, alarmCount: 2, lastSeen: '05/05/2026 07:40:10 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200024', linea: '+51 984 020 005', groups: [{ name: 'Minera Andahuaylilas', subgroup: 'Transporte Pesado' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '35%', alarmCount: 2, lastSeen: '05/05/2026 07:40:10 a.m.' }] as GpsDevice[] },
  { id: '25', name: 'LUCIANA', owner: 'Logística Wiracocha EIRL', plate: 'CUS-404', engineCode: 'K24A-CU-025', type: 'car', status: 'offline' as const, position: [-13.5100, -71.9900] as [number, number], speed: '0 km/h', address: 'Av. Grau 320, Cusco', coords: '-13.510000, -71.990000', direction: '-', odometer: '29,600 KM', fuel: '8%', gpsCount: 1, alarmCount: 5, lastSeen: '02/05/2026 11:30:00 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200025', linea: '+51 984 020 006', groups: [{ name: 'Logística Wiracocha', subgroup: 'Flota Sur' }], reportStatus: 'disconnected' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '8%', alarmCount: 5, lastSeen: '02/05/2026 11:30:00 a.m.' }] as GpsDevice[] },

  // ── TRUJILLO ─────────────────────────────────────────────────────────────────
  { id: '26', name: 'ROBERTO', owner: 'Transportes Trujillo SAC', plate: 'TRU-101', engineCode: 'D4D-TR-026', type: 'truck', status: 'active' as const, position: [-8.1050, -79.0350] as [number, number], speed: '60 km/h', address: 'Av. España 800, Trujillo', coords: '-8.105000, -79.035000', direction: 'Norte', odometer: '43,100 KM', fuel: '68%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:02:44 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200026', linea: '+51 944 026 001', groups: [{ name: 'Transportes Trujillo', subgroup: 'Flota Norte' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '60 km/h', fuel: '68%', alarmCount: 0, lastSeen: '05/05/2026 09:02:44 a.m.' }] as GpsDevice[] },
  { id: '27', name: 'NATALIA', owner: 'Distribuidora La Libertad EIRL', plate: 'TRU-202', engineCode: '2NZ-TR-027', type: 'car', status: 'active' as const, position: [-8.1180, -79.0220] as [number, number], speed: '42 km/h', address: 'Av. Larco 1500, Trujillo', coords: '-8.118000, -79.022000', direction: 'Sur-Oeste', odometer: '6,800 KM', fuel: '78%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:09:33 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200027', linea: '+51 944 026 002', groups: [{ name: 'Distribuidora La Libertad', subgroup: 'Reparto' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '42 km/h', fuel: '78%', alarmCount: 0, lastSeen: '05/05/2026 09:09:33 a.m.' }] as GpsDevice[] },
  { id: '28', name: 'RUTA-TR1', owner: 'Bus Metropolitano Trujillo SA', plate: 'BUS-601', engineCode: 'ISB-TR-028', type: 'bus', status: 'active' as const, position: [-8.0980, -79.0410] as [number, number], speed: '38 km/h', address: 'Av. Mansiche 2200, Trujillo', coords: '-8.098000, -79.041000', direction: 'Este', odometer: '145,200 KM', fuel: '55%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 09:07:19 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200028', linea: '+51 944 026 003', groups: [{ name: 'Bus Metropolitano TRU', subgroup: 'Línea A' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '38 km/h', fuel: '55%', alarmCount: 1, lastSeen: '05/05/2026 09:07:19 a.m.' }] as GpsDevice[] },
  { id: '29', name: 'JORGE', owner: 'Carga Pesada Norte SAC', plate: 'TRU-303', engineCode: 'ISX-TR-029', type: 'truck', status: 'stopped' as const, position: [-8.1250, -79.0150] as [number, number], speed: '0 km/h', address: 'Av. Industrial 600, Trujillo', coords: '-8.125000, -79.015000', direction: '-', odometer: '112,800 KM', fuel: '30%', gpsCount: 1, alarmCount: 4, lastSeen: '05/05/2026 07:15:50 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200029', linea: '+51 944 026 004', groups: [{ name: 'Carga Pesada Norte', subgroup: 'Flota Trujillo' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '30%', alarmCount: 4, lastSeen: '05/05/2026 07:15:50 a.m.' }] as GpsDevice[] },
  { id: '30', name: 'GISELA', owner: 'Courier Norte EIRL', plate: 'MOT-801', engineCode: 'YS-TR-030', type: 'motorcycle', status: 'active' as const, position: [-8.1100, -79.0300] as [number, number], speed: '25 km/h', address: 'Jr. Pizarro 440, Trujillo', coords: '-8.110000, -79.030000', direction: 'Norte', odometer: '4,500 KM', fuel: '83%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:12:08 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200030', linea: '+51 944 026 005', groups: [{ name: 'Courier Norte', subgroup: 'Delivery' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '25 km/h', fuel: '83%', alarmCount: 0, lastSeen: '05/05/2026 09:12:08 a.m.' }] as GpsDevice[] },
  { id: '31', name: 'HERNAN', owner: 'Logística Chimú SA', plate: 'TRU-404', engineCode: 'K24A-TR-031', type: 'car', status: 'offline' as const, position: [-8.1320, -79.0080] as [number, number], speed: '0 km/h', address: 'Av. América Sur 1800, Trujillo', coords: '-8.132000, -79.008000', direction: '-', odometer: '35,700 KM', fuel: '12%', gpsCount: 1, alarmCount: 3, lastSeen: '04/05/2026 03:45:00 p.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200031', linea: '+51 944 026 006', groups: [{ name: 'Logística Chimú', subgroup: 'Flota Sur' }], reportStatus: 'disconnected' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '12%', alarmCount: 3, lastSeen: '04/05/2026 03:45:00 p.m.' }] as GpsDevice[] },

  // ── PIURA ────────────────────────────────────────────────────────────────────
  { id: '32', name: 'AUGUSTO', owner: 'Transportes Piura SAC', plate: 'PIU-101', engineCode: 'D4D-PI-032', type: 'truck', status: 'active' as const, position: [-5.1880, -80.6270] as [number, number], speed: '65 km/h', address: 'Av. Sánchez Cerro 800, Piura', coords: '-5.188000, -80.627000', direction: 'Norte', odometer: '28,400 KM', fuel: '74%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:04:22 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200032', linea: '+51 973 032 001', groups: [{ name: 'Transportes Piura', subgroup: 'Flota Norte' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '65 km/h', fuel: '74%', alarmCount: 0, lastSeen: '05/05/2026 09:04:22 a.m.' }] as GpsDevice[] },
  { id: '33', name: 'VALERIA', owner: 'Distribuidora Piura EIRL', plate: 'PIU-202', engineCode: '2NZ-PI-033', type: 'car', status: 'active' as const, position: [-5.2010, -80.6380] as [number, number], speed: '48 km/h', address: 'Av. Loreto 1200, Piura', coords: '-5.201000, -80.638000', direction: 'Sur-Este', odometer: '9,300 KM', fuel: '61%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:06:14 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200033', linea: '+51 973 032 002', groups: [{ name: 'Distribuidora Piura', subgroup: 'Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '48 km/h', fuel: '61%', alarmCount: 0, lastSeen: '05/05/2026 09:06:14 a.m.' }] as GpsDevice[] },
  { id: '34', name: 'OMAR', owner: 'Courier Piura SAC', plate: 'MOT-901', engineCode: 'PCX-PI-034', type: 'motorcycle', status: 'active' as const, position: [-5.1960, -80.6320] as [number, number], speed: '29 km/h', address: 'Jr. Arequipa 350, Piura', coords: '-5.196000, -80.632000', direction: 'Oeste', odometer: '6,200 KM', fuel: '77%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:13:30 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200034', linea: '+51 973 032 003', groups: [{ name: 'Courier Piura', subgroup: 'Delivery' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '29 km/h', fuel: '77%', alarmCount: 0, lastSeen: '05/05/2026 09:13:30 a.m.' }] as GpsDevice[] },
  { id: '35', name: 'RUTA-PI1', owner: 'Bus Regional Piura SA', plate: 'BUS-701', engineCode: 'ISB-PI-035', type: 'bus', status: 'active' as const, position: [-5.1820, -80.6400] as [number, number], speed: '50 km/h', address: 'Av. Panamericana Norte Km 972, Piura', coords: '-5.182000, -80.640000', direction: 'Norte', odometer: '78,900 KM', fuel: '58%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:09:05 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200035', linea: '+51 973 032 004', groups: [{ name: 'Bus Regional Piura', subgroup: 'Línea Norte' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '50 km/h', fuel: '58%', alarmCount: 0, lastSeen: '05/05/2026 09:09:05 a.m.' }] as GpsDevice[] },
  { id: '36', name: 'CESAR', owner: 'Carga Pesada Piura SA', plate: 'PIU-303', engineCode: 'ISX-PI-036', type: 'truck', status: 'stopped' as const, position: [-5.2100, -80.6200] as [number, number], speed: '0 km/h', address: 'Av. Guardia Civil 900, Piura', coords: '-5.210000, -80.620000', direction: '-', odometer: '87,500 KM', fuel: '22%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 07:30:00 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200036', linea: '+51 973 032 005', groups: [{ name: 'Carga Pesada Piura', subgroup: 'Flota Pesada' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '22%', alarmCount: 0, lastSeen: '05/05/2026 07:30:00 a.m.' }] as GpsDevice[] },

  // ── CHICLAYO ─────────────────────────────────────────────────────────────────
  { id: '37', name: 'MIRIAM', owner: 'Transportes Chiclayo SAC', plate: 'CHI-101', engineCode: 'D4D-CH-037', type: 'truck', status: 'active' as const, position: [-6.7690, -79.8390] as [number, number], speed: '52 km/h', address: 'Av. Balta 800, Chiclayo', coords: '-6.769000, -79.839000', direction: 'Este', odometer: '31,600 KM', fuel: '69%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:01:55 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200037', linea: '+51 974 037 001', groups: [{ name: 'Transportes Chiclayo', subgroup: 'Flota Norte' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '52 km/h', fuel: '69%', alarmCount: 0, lastSeen: '05/05/2026 09:01:55 a.m.' }] as GpsDevice[] },
  { id: '38', name: 'ANITA', owner: 'Distribuidora Lambayeque EIRL', plate: 'CHI-202', engineCode: '2NZ-CH-038', type: 'car', status: 'active' as const, position: [-6.7820, -79.8500] as [number, number], speed: '35 km/h', address: 'Av. Luis Gonzales 1100, Chiclayo', coords: '-6.782000, -79.850000', direction: 'Oeste', odometer: '7,400 KM', fuel: '84%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:10:22 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200038', linea: '+51 974 037 002', groups: [{ name: 'Distribuidora Lambayeque', subgroup: 'Reparto' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '35 km/h', fuel: '84%', alarmCount: 0, lastSeen: '05/05/2026 09:10:22 a.m.' }] as GpsDevice[] },
  { id: '39', name: 'RICHARD', owner: 'Courier Chiclayo SAC', plate: 'MOT-1001', engineCode: 'YS-CH-039', type: 'motorcycle', status: 'active' as const, position: [-6.7750, -79.8440] as [number, number], speed: '31 km/h', address: 'Calle San José 210, Chiclayo', coords: '-6.775000, -79.844000', direction: 'Norte', odometer: '5,800 KM', fuel: '76%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:14:48 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200039', linea: '+51 974 037 003', groups: [{ name: 'Courier Chiclayo', subgroup: 'Delivery' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '31 km/h', fuel: '76%', alarmCount: 0, lastSeen: '05/05/2026 09:14:48 a.m.' }] as GpsDevice[] },
  { id: '40', name: 'RUTA-CH1', owner: 'Bus Urbano Chiclayo SA', plate: 'BUS-801', engineCode: 'ISB-CH-040', type: 'bus', status: 'active' as const, position: [-6.7630, -79.8530] as [number, number], speed: '44 km/h', address: 'Av. Venezuela 1600, Chiclayo', coords: '-6.763000, -79.853000', direction: 'Sur', odometer: '102,400 KM', fuel: '53%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 09:08:37 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200040', linea: '+51 974 037 004', groups: [{ name: 'Bus Urbano Chiclayo', subgroup: 'Línea A' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '44 km/h', fuel: '53%', alarmCount: 1, lastSeen: '05/05/2026 09:08:37 a.m.' }] as GpsDevice[] },
  { id: '41', name: 'GABRIEL', owner: 'Logística Sipán SAC', plate: 'CHI-303', engineCode: 'ISX-CH-041', type: 'truck', status: 'offline' as const, position: [-6.7900, -79.8350] as [number, number], speed: '0 km/h', address: 'Av. Miguel Grau 2400, Chiclayo', coords: '-6.790000, -79.835000', direction: '-', odometer: '63,200 KM', fuel: '3%', gpsCount: 1, alarmCount: 7, lastSeen: '02/05/2026 05:00:00 p.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200041', linea: '+51 974 037 005', groups: [{ name: 'Logística Sipán', subgroup: 'Flota Norte' }], reportStatus: 'disconnected' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '3%', alarmCount: 7, lastSeen: '02/05/2026 05:00:00 p.m.' }] as GpsDevice[] },

  // ── IQUITOS ──────────────────────────────────────────────────────────────────
  { id: '42', name: 'DARWIN', owner: 'Transportes Loreto SAC', plate: 'IQU-101', engineCode: 'D4D-IQ-042', type: 'truck', status: 'active' as const, position: [-3.7420, -73.2560] as [number, number], speed: '35 km/h', address: 'Av. Abelardo Quiñones Km 2, Iquitos', coords: '-3.742000, -73.256000', direction: 'Sur', odometer: '19,800 KM', fuel: '66%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:03:40 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200042', linea: '+51 965 042 001', groups: [{ name: 'Transportes Loreto', subgroup: 'Flota Selva' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '35 km/h', fuel: '66%', alarmCount: 0, lastSeen: '05/05/2026 09:03:40 a.m.' }] as GpsDevice[] },
  { id: '43', name: 'SHIRLEY', owner: 'Distribuidora Amazónica EIRL', plate: 'IQU-202', engineCode: '2NZ-IQ-043', type: 'car', status: 'active' as const, position: [-3.7550, -73.2430] as [number, number], speed: '28 km/h', address: 'Jr. Próspero 800, Iquitos', coords: '-3.755000, -73.243000', direction: 'Norte', odometer: '12,100 KM', fuel: '59%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:07:55 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200043', linea: '+51 965 042 002', groups: [{ name: 'Distribuidora Amazónica', subgroup: 'Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '28 km/h', fuel: '59%', alarmCount: 0, lastSeen: '05/05/2026 09:07:55 a.m.' }] as GpsDevice[] },
  { id: '44', name: 'KEVIN', owner: 'Courier Selva SAC', plate: 'MOT-1101', engineCode: 'PCX-IQ-044', type: 'motorcycle', status: 'active' as const, position: [-3.7480, -73.2500] as [number, number], speed: '20 km/h', address: 'Av. La Marina 400, Iquitos', coords: '-3.748000, -73.250000', direction: 'Este', odometer: '8,900 KM', fuel: '85%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:13:22 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200044', linea: '+51 965 042 003', groups: [{ name: 'Courier Selva', subgroup: 'Delivery' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '20 km/h', fuel: '85%', alarmCount: 0, lastSeen: '05/05/2026 09:13:22 a.m.' }] as GpsDevice[] },
  { id: '45', name: 'MARLENE', owner: 'Logística Amazónica SA', plate: 'IQU-303', engineCode: 'ISB-IQ-045', type: 'truck', status: 'stopped' as const, position: [-3.7350, -73.2620] as [number, number], speed: '0 km/h', address: 'Carretera Iquitos-Nauta Km 5, Loreto', coords: '-3.735000, -73.262000', direction: '-', odometer: '45,600 KM', fuel: '38%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 07:10:00 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200045', linea: '+51 965 042 004', groups: [{ name: 'Logística Amazónica', subgroup: 'Flota Selva' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '38%', alarmCount: 0, lastSeen: '05/05/2026 07:10:00 a.m.' }] as GpsDevice[] },

  // ── PUNO ─────────────────────────────────────────────────────────────────────
  { id: '46', name: 'EDGAR', owner: 'Transportes Altiplano SAC', plate: 'PUN-101', engineCode: 'D4D-PU-046', type: 'truck', status: 'active' as const, position: [-15.8350, -70.0280] as [number, number], speed: '48 km/h', address: 'Jr. Lima 800, Puno', coords: '-15.835000, -70.028000', direction: 'Norte', odometer: '62,300 KM', fuel: '71%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:05:50 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200046', linea: '+51 951 046 001', groups: [{ name: 'Transportes Altiplano', subgroup: 'Flota Puno' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '48 km/h', fuel: '71%', alarmCount: 0, lastSeen: '05/05/2026 09:05:50 a.m.' }] as GpsDevice[] },
  { id: '47', name: 'YANIRA', owner: 'Distribuidora Titicaca EIRL', plate: 'PUN-202', engineCode: 'K24A-PU-047', type: 'car', status: 'active' as const, position: [-15.8460, -70.0160] as [number, number], speed: '33 km/h', address: 'Av. El Puerto 1200, Puno', coords: '-15.846000, -70.016000', direction: 'Sur-Este', odometer: '14,700 KM', fuel: '67%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:11:10 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200047', linea: '+51 951 046 002', groups: [{ name: 'Distribuidora Titicaca', subgroup: 'Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '33 km/h', fuel: '67%', alarmCount: 0, lastSeen: '05/05/2026 09:11:10 a.m.' }] as GpsDevice[] },
  { id: '48', name: 'ROLANDO', owner: 'Minera Andes del Sur SA', plate: 'PUN-303', engineCode: 'ISX-PU-048', type: 'truck', status: 'stopped' as const, position: [-15.8280, -70.0330] as [number, number], speed: '0 km/h', address: 'Av. Costanera 400, Puno', coords: '-15.828000, -70.033000', direction: '-', odometer: '89,100 KM', fuel: '28%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 07:45:30 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200048', linea: '+51 951 046 003', groups: [{ name: 'Minera Andes del Sur', subgroup: 'Transporte Pesado' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '28%', alarmCount: 0, lastSeen: '05/05/2026 07:45:30 a.m.' }] as GpsDevice[] },
  { id: '49', name: 'FLOR', owner: 'Courier Puno SAC', plate: 'MOT-1201', engineCode: 'PCX-PU-049', type: 'motorcycle', status: 'active' as const, position: [-15.8400, -70.0200] as [number, number], speed: '24 km/h', address: 'Jr. Deustua 560, Puno', coords: '-15.840000, -70.020000', direction: 'Norte', odometer: '3,600 KM', fuel: '92%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:14:15 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200049', linea: '+51 951 046 004', groups: [{ name: 'Courier Puno', subgroup: 'Delivery' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '24 km/h', fuel: '92%', alarmCount: 0, lastSeen: '05/05/2026 09:14:15 a.m.' }] as GpsDevice[] },

  // ── TACNA ────────────────────────────────────────────────────────────────────
  { id: '50', name: 'FREDY', owner: 'Transportes Frontera SAC', plate: 'TAC-101', engineCode: 'D4D-TA-050', type: 'truck', status: 'active' as const, position: [-18.0010, -70.2520] as [number, number], speed: '70 km/h', address: 'Av. Bolognesi 1200, Tacna', coords: '-18.001000, -70.252000', direction: 'Norte', odometer: '47,800 KM', fuel: '73%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:02:30 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200050', linea: '+51 952 050 001', groups: [{ name: 'Transportes Frontera', subgroup: 'Flota Tacna' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '70 km/h', fuel: '73%', alarmCount: 0, lastSeen: '05/05/2026 09:02:30 a.m.' }] as GpsDevice[] },
  { id: '51', name: 'DIANA', owner: 'Distribuidora Tarapacá EIRL', plate: 'TAC-202', engineCode: '2NZ-TA-051', type: 'car', status: 'active' as const, position: [-18.0120, -70.2410] as [number, number], speed: '40 km/h', address: 'Av. Patricio Meléndez 800, Tacna', coords: '-18.012000, -70.241000', direction: 'Sur-Oeste', odometer: '18,200 KM', fuel: '60%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 09:08:44 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200051', linea: '+51 952 050 002', groups: [{ name: 'Distribuidora Tarapacá', subgroup: 'Reparto' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '40 km/h', fuel: '60%', alarmCount: 1, lastSeen: '05/05/2026 09:08:44 a.m.' }] as GpsDevice[] },
  { id: '52', name: 'ALDO', owner: 'Carga Sur Extremo SA', plate: 'TAC-303', engineCode: 'ISX-TA-052', type: 'truck', status: 'stopped' as const, position: [-17.9950, -70.2600] as [number, number], speed: '0 km/h', address: 'Av. Industrial 500, Tacna', coords: '-17.995000, -70.260000', direction: '-', odometer: '134,500 KM', fuel: '18%', gpsCount: 1, alarmCount: 4, lastSeen: '05/05/2026 07:00:00 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200052', linea: '+51 952 050 003', groups: [{ name: 'Carga Sur Extremo', subgroup: 'Flota Pesada' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '18%', alarmCount: 4, lastSeen: '05/05/2026 07:00:00 a.m.' }] as GpsDevice[] },

  // ── ICA ──────────────────────────────────────────────────────────────────────
  { id: '53', name: 'HECTOR', owner: 'Agroexportadora Ica SA', plate: 'ICA-101', engineCode: 'D4D-IC-053', type: 'truck', status: 'active' as const, position: [-14.0620, -75.7340] as [number, number], speed: '58 km/h', address: 'Av. Municipalidad 800, Ica', coords: '-14.062000, -75.734000', direction: 'Norte', odometer: '55,700 KM', fuel: '64%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:04:55 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200053', linea: '+51 956 053 001', groups: [{ name: 'Agroexportadora Ica', subgroup: 'Flota Ica' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '58 km/h', fuel: '64%', alarmCount: 0, lastSeen: '05/05/2026 09:04:55 a.m.' }] as GpsDevice[] },
  { id: '54', name: 'PATRICIA', owner: 'Distribuidora Nazca EIRL', plate: 'ICA-202', engineCode: 'K24A-IC-054', type: 'car', status: 'active' as const, position: [-14.0750, -75.7210] as [number, number], speed: '44 km/h', address: 'Av. Grau 1400, Ica', coords: '-14.075000, -75.721000', direction: 'Sur', odometer: '10,300 KM', fuel: '79%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:10:05 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200054', linea: '+51 956 053 002', groups: [{ name: 'Distribuidora Nazca', subgroup: 'Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '44 km/h', fuel: '79%', alarmCount: 0, lastSeen: '05/05/2026 09:10:05 a.m.' }] as GpsDevice[] },
  { id: '55', name: 'IVAN', owner: 'Courier Ica SAC', plate: 'MOT-1301', engineCode: 'YS-IC-055', type: 'motorcycle', status: 'active' as const, position: [-14.0680, -75.7280] as [number, number], speed: '26 km/h', address: 'Jr. Lima 320, Ica', coords: '-14.068000, -75.728000', direction: 'Este', odometer: '4,100 KM', fuel: '87%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:13:44 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200055', linea: '+51 956 053 003', groups: [{ name: 'Courier Ica', subgroup: 'Delivery' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '26 km/h', fuel: '87%', alarmCount: 0, lastSeen: '05/05/2026 09:13:44 a.m.' }] as GpsDevice[] },
  { id: '56', name: 'ANDREA', owner: 'Logística Paracas SA', plate: 'ICA-303', engineCode: 'ISB-IC-056', type: 'truck', status: 'offline' as const, position: [-14.0530, -75.7400] as [number, number], speed: '0 km/h', address: 'Av. Los Maestros 600, Ica', coords: '-14.053000, -75.740000', direction: '-', odometer: '78,400 KM', fuel: '6%', gpsCount: 1, alarmCount: 5, lastSeen: '03/05/2026 08:20:00 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200056', linea: '+51 956 053 004', groups: [{ name: 'Logística Paracas', subgroup: 'Flota Sur' }], reportStatus: 'disconnected' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '6%', alarmCount: 5, lastSeen: '03/05/2026 08:20:00 a.m.' }] as GpsDevice[] },

  // ── HUANCAYO ─────────────────────────────────────────────────────────────────
  { id: '57', name: 'GILBERTO', owner: 'Transportes Junín SAC', plate: 'HYO-101', engineCode: 'D4D-HY-057', type: 'truck', status: 'active' as const, position: [-12.0590, -75.2100] as [number, number], speed: '46 km/h', address: 'Av. Ferrocarril 1200, Huancayo', coords: '-12.059000, -75.210000', direction: 'Norte', odometer: '38,900 KM', fuel: '67%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:03:28 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200057', linea: '+51 964 057 001', groups: [{ name: 'Transportes Junín', subgroup: 'Flota Sierra Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '46 km/h', fuel: '67%', alarmCount: 0, lastSeen: '05/05/2026 09:03:28 a.m.' }] as GpsDevice[] },
  { id: '58', name: 'SONIA', owner: 'Distribuidora Mantaro EIRL', plate: 'HYO-202', engineCode: '2NZ-HY-058', type: 'car', status: 'active' as const, position: [-12.0710, -75.1980] as [number, number], speed: '36 km/h', address: 'Real 1800, Huancayo', coords: '-12.071000, -75.198000', direction: 'Sur-Este', odometer: '13,500 KM', fuel: '75%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:09:50 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200058', linea: '+51 964 057 002', groups: [{ name: 'Distribuidora Mantaro', subgroup: 'Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '36 km/h', fuel: '75%', alarmCount: 0, lastSeen: '05/05/2026 09:09:50 a.m.' }] as GpsDevice[] },
  { id: '59', name: 'RUTA-HY1', owner: 'Bus Andino Junín SA', plate: 'BUS-901', engineCode: 'ISB-HY-059', type: 'bus', status: 'active' as const, position: [-12.0500, -75.2200] as [number, number], speed: '40 km/h', address: 'Av. Huancavelica 900, Huancayo', coords: '-12.050000, -75.220000', direction: 'Norte', odometer: '93,600 KM', fuel: '57%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:07:35 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200059', linea: '+51 964 057 003', groups: [{ name: 'Bus Andino Junín', subgroup: 'Línea Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '40 km/h', fuel: '57%', alarmCount: 0, lastSeen: '05/05/2026 09:07:35 a.m.' }] as GpsDevice[] },
  { id: '60', name: 'NILDA', owner: 'Courier Sierra SAC', plate: 'MOT-1401', engineCode: 'PCX-HY-060', type: 'motorcycle', status: 'stopped' as const, position: [-12.0650, -75.2050] as [number, number], speed: '0 km/h', address: 'Jr. Ancash 440, Huancayo', coords: '-12.065000, -75.205000', direction: '-', odometer: '7,200 KM', fuel: '45%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 08:30:00 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200060', linea: '+51 964 057 004', groups: [{ name: 'Courier Sierra', subgroup: 'Delivery' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '45%', alarmCount: 0, lastSeen: '05/05/2026 08:30:00 a.m.' }] as GpsDevice[] },

  // ── CAJAMARCA ────────────────────────────────────────────────────────────────
  { id: '61', name: 'PERCY', owner: 'Transportes Cajamarca SAC', plate: 'CAJ-101', engineCode: 'D4D-CA-061', type: 'truck', status: 'active' as const, position: [-7.1580, -78.5060] as [number, number], speed: '53 km/h', address: 'Av. Héroes del Cenepa 800, Cajamarca', coords: '-7.158000, -78.506000', direction: 'Norte', odometer: '44,200 KM', fuel: '69%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:02:18 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200061', linea: '+51 976 061 001', groups: [{ name: 'Transportes Cajamarca', subgroup: 'Flota Norte' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '53 km/h', fuel: '69%', alarmCount: 0, lastSeen: '05/05/2026 09:02:18 a.m.' }] as GpsDevice[] },
  { id: '62', name: 'TERESA', owner: 'Distribuidora Cajamarca EIRL', plate: 'CAJ-202', engineCode: 'K24A-CA-062', type: 'car', status: 'active' as const, position: [-7.1700, -78.4940] as [number, number], speed: '31 km/h', address: 'Jr. Del Comercio 600, Cajamarca', coords: '-7.170000, -78.494000', direction: 'Oeste', odometer: '9,800 KM', fuel: '82%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:10:30 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200062', linea: '+51 976 061 002', groups: [{ name: 'Distribuidora Cajamarca', subgroup: 'Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '31 km/h', fuel: '82%', alarmCount: 0, lastSeen: '05/05/2026 09:10:30 a.m.' }] as GpsDevice[] },
  { id: '63', name: 'ABEL', owner: 'Minera Gold Cajamarca SA', plate: 'CAJ-303', engineCode: 'ISX-CA-063', type: 'truck', status: 'stopped' as const, position: [-7.1500, -78.5150] as [number, number], speed: '0 km/h', address: 'Av. Industrial Norte 1400, Cajamarca', coords: '-7.150000, -78.515000', direction: '-', odometer: '103,700 KM', fuel: '31%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 07:25:00 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200063', linea: '+51 976 061 003', groups: [{ name: 'Minera Gold Cajamarca', subgroup: 'Transporte Pesado' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '31%', alarmCount: 0, lastSeen: '05/05/2026 07:25:00 a.m.' }] as GpsDevice[] },

  // ── CHIMBOTE ─────────────────────────────────────────────────────────────────
  { id: '64', name: 'MARCOS', owner: 'Pesquera Ancash SAC', plate: 'CHB-101', engineCode: 'D4D-CB-064', type: 'truck', status: 'active' as const, position: [-9.0700, -78.5840] as [number, number], speed: '62 km/h', address: 'Av. Pardo 1800, Chimbote', coords: '-9.070000, -78.584000', direction: 'Sur', odometer: '27,400 KM', fuel: '76%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:04:10 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200064', linea: '+51 943 064 001', groups: [{ name: 'Pesquera Ancash', subgroup: 'Flota Costera' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '62 km/h', fuel: '76%', alarmCount: 0, lastSeen: '05/05/2026 09:04:10 a.m.' }] as GpsDevice[] },
  { id: '65', name: 'JESSICA', owner: 'Distribuidora Chimbote EIRL', plate: 'CHB-202', engineCode: '2NZ-CB-065', type: 'car', status: 'active' as const, position: [-9.0830, -78.5720] as [number, number], speed: '39 km/h', address: 'Av. José Gálvez 900, Chimbote', coords: '-9.083000, -78.572000', direction: 'Norte', odometer: '11,900 KM', fuel: '71%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:09:20 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200065', linea: '+51 943 064 002', groups: [{ name: 'Distribuidora Chimbote', subgroup: 'Reparto' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '39 km/h', fuel: '71%', alarmCount: 0, lastSeen: '05/05/2026 09:09:20 a.m.' }] as GpsDevice[] },
  { id: '66', name: 'PABLO', owner: 'Carga Pesada Ancash SA', plate: 'CHB-303', engineCode: 'ISX-CB-066', type: 'truck', status: 'offline' as const, position: [-9.0610, -78.5900] as [number, number], speed: '0 km/h', address: 'Av. Meiggs 2200, Chimbote', coords: '-9.061000, -78.590000', direction: '-', odometer: '91,300 KM', fuel: '4%', gpsCount: 1, alarmCount: 0, lastSeen: '03/05/2026 06:30:00 p.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200066', linea: '+51 943 064 003', groups: [{ name: 'Carga Pesada Ancash', subgroup: 'Flota Pesada' }], reportStatus: 'disconnected' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '4%', alarmCount: 0, lastSeen: '03/05/2026 06:30:00 p.m.' }] as GpsDevice[] },

  // ── HUÁNUCO ──────────────────────────────────────────────────────────────────
  { id: '67', name: 'LEONEL', owner: 'Transportes Huánuco SAC', plate: 'HCO-101', engineCode: 'D4D-HU-067', type: 'truck', status: 'active' as const, position: [-9.9250, -76.2480] as [number, number], speed: '44 km/h', address: 'Av. Universitaria 600, Huánuco', coords: '-9.925000, -76.248000', direction: 'Norte', odometer: '33,800 KM', fuel: '63%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:03:05 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200067', linea: '+51 962 067 001', groups: [{ name: 'Transportes Huánuco', subgroup: 'Flota Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '44 km/h', fuel: '63%', alarmCount: 0, lastSeen: '05/05/2026 09:03:05 a.m.' }] as GpsDevice[] },
  { id: '68', name: 'ROSARIO', owner: 'Distribuidora Huallaga EIRL', plate: 'HCO-202', engineCode: 'K24A-HU-068', type: 'car', status: 'active' as const, position: [-9.9380, -76.2350] as [number, number], speed: '34 km/h', address: 'Jr. General Prado 800, Huánuco', coords: '-9.938000, -76.235000', direction: 'Oeste', odometer: '8,600 KM', fuel: '80%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:11:00 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200068', linea: '+51 962 067 002', groups: [{ name: 'Distribuidora Huallaga', subgroup: 'Centro' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '34 km/h', fuel: '80%', alarmCount: 0, lastSeen: '05/05/2026 09:11:00 a.m.' }] as GpsDevice[] },
  { id: '69', name: 'JONATAN', owner: 'Courier Selva Central SAC', plate: 'MOT-1501', engineCode: 'PCX-HU-069', type: 'motorcycle', status: 'stopped' as const, position: [-9.9180, -76.2550] as [number, number], speed: '0 km/h', address: 'Av. 28 de Julio 340, Huánuco', coords: '-9.918000, -76.255000', direction: '-', odometer: '5,400 KM', fuel: '52%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 08:50:00 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200069', linea: '+51 962 067 003', groups: [{ name: 'Courier Selva Central', subgroup: 'Delivery' }], reportStatus: 'low-signal' as const, ignition: 'off' as const, speed: '0 km/h', fuel: '52%', alarmCount: 0, lastSeen: '05/05/2026 08:50:00 a.m.' }] as GpsDevice[] },

  // ── AISLADOS EN CARRETERAS (Sesión 10) ────────────────────────────────────
  // Vehículos solitarios en carreteras grandes, visibles individualmente al acercar el mapa
  { id: '70', name: 'FERNANDO', owner: 'Transportes Carretera Central SAC', plate: 'CRL-101', engineCode: 'D4D-CC-070', type: 'truck', status: 'active' as const, position: [-11.7500, -76.3000] as [number, number], speed: '35 km/h', address: 'Carretera Central Km 72, San Mateo, Huarochirí', coords: '-11.750000, -76.300000', direction: 'Este', odometer: '142,800 KM', fuel: '58%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:05:22 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200070', linea: '+51 954 070 001', groups: [{ name: 'Transportes Carretera Central', subgroup: 'Flota Sierra' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '35 km/h', fuel: '58%', alarmCount: 0, lastSeen: '05/05/2026 09:05:22 a.m.' }] as GpsDevice[] },
  { id: '71', name: 'SILVIA', owner: 'Logística Andina EIRL', plate: 'CRL-202', engineCode: 'ISB-CC-071', type: 'truck', status: 'active' as const, position: [-11.5200, -75.9000] as [number, number], speed: '28 km/h', address: 'Carretera Central Km 142, La Oroya, Yauli', coords: '-11.520000, -75.900000', direction: 'Noreste', odometer: '198,200 KM', fuel: '45%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 08:55:10 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200071', linea: '+51 954 070 002', groups: [{ name: 'Logística Andina', subgroup: 'Flota Sierra' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '28 km/h', fuel: '45%', alarmCount: 1, lastSeen: '05/05/2026 08:55:10 a.m.' }] as GpsDevice[] },
  { id: '72', name: 'ELOY', owner: 'Distribuidora Junín SAC', plate: 'CRL-303', engineCode: 'K24A-CC-072', type: 'car', status: 'active' as const, position: [-11.4200, -75.6900] as [number, number], speed: '55 km/h', address: 'Carretera Central Km 190, Tarma', coords: '-11.420000, -75.690000', direction: 'Norte', odometer: '21,500 KM', fuel: '72%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:12:44 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200072', linea: '+51 954 070 003', groups: [{ name: 'Distribuidora Junín', subgroup: 'Reparto Sierra' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '55 km/h', fuel: '72%', alarmCount: 0, lastSeen: '05/05/2026 09:12:44 a.m.' }] as GpsDevice[] },

  // ── PANAMERICANA NORTE ──────────────────────────────────────────────────
  { id: '73', name: 'HUMBERTO', owner: 'Transportes Norteño SAC', plate: 'PAN-101', engineCode: 'ISX-PN-073', type: 'truck', status: 'active' as const, position: [-11.1000, -77.6100] as [number, number], speed: '75 km/h', address: 'Panamericana Norte Km 145, Huacho', coords: '-11.100000, -77.610000', direction: 'Norte', odometer: '312,400 KM', fuel: '68%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:08:33 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200073', linea: '+51 973 070 001', groups: [{ name: 'Transportes Norteño', subgroup: 'Larga Distancia' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '75 km/h', fuel: '68%', alarmCount: 0, lastSeen: '05/05/2026 09:08:33 a.m.' }] as GpsDevice[] },
  { id: '74', name: 'ROXANA', owner: 'Carga Norte SAC', plate: 'PAN-202', engineCode: 'D4D-PN-074', type: 'truck', status: 'active' as const, position: [-10.0700, -78.1600] as [number, number], speed: '80 km/h', address: 'Panamericana Norte Km 260, Huarmey', coords: '-10.070000, -78.160000', direction: 'Norte', odometer: '267,100 KM', fuel: '55%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 09:01:15 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200074', linea: '+51 973 070 002', groups: [{ name: 'Carga Norte', subgroup: 'Larga Distancia' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '80 km/h', fuel: '55%', alarmCount: 1, lastSeen: '05/05/2026 09:01:15 a.m.' }] as GpsDevice[] },

  // ── PANAMERICANA SUR ──────────────────────────────────────────────────
  { id: '75', name: 'ELISA', owner: 'Transportes del Sur EIRL', plate: 'PAS-101', engineCode: '2NZ-PS-075', type: 'car', status: 'active' as const, position: [-12.4800, -76.7900] as [number, number], speed: '65 km/h', address: 'Panamericana Sur Km 50, Pucusana', coords: '-12.480000, -76.790000', direction: 'Sur', odometer: '18,900 KM', fuel: '81%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:10:05 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200075', linea: '+51 956 070 001', groups: [{ name: 'Transportes del Sur', subgroup: 'Costa Sur' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '65 km/h', fuel: '81%', alarmCount: 0, lastSeen: '05/05/2026 09:10:05 a.m.' }] as GpsDevice[] },
  { id: '76', name: 'FAUSTO', owner: 'Agroexportadora Cañete SA', plate: 'PAS-202', engineCode: 'K24A-PS-076', type: 'truck', status: 'active' as const, position: [-13.0800, -76.3900] as [number, number], speed: '72 km/h', address: 'Panamericana Sur Km 130, Cañete', coords: '-13.080000, -76.390000', direction: 'Sur', odometer: '89,600 KM', fuel: '63%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:04:40 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200076', linea: '+51 956 070 002', groups: [{ name: 'Agroexportadora Cañete', subgroup: 'Costa Sur' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '72 km/h', fuel: '63%', alarmCount: 0, lastSeen: '05/05/2026 09:04:40 a.m.' }] as GpsDevice[] },
  { id: '77', name: 'BETTY', owner: 'Distribuidora Chincha EIRL', plate: 'PAS-303', engineCode: 'ISB-PS-077', type: 'car', status: 'active' as const, position: [-13.4200, -76.1300] as [number, number], speed: '58 km/h', address: 'Panamericana Sur Km 190, Chincha', coords: '-13.420000, -76.130000', direction: 'Sur', odometer: '14,700 KM', fuel: '70%', gpsCount: 1, alarmCount: 1, lastSeen: '05/05/2026 09:07:18 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200077', linea: '+51 956 070 003', groups: [{ name: 'Distribuidora Chincha', subgroup: 'Costa Sur' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '58 km/h', fuel: '70%', alarmCount: 1, lastSeen: '05/05/2026 09:07:18 a.m.' }] as GpsDevice[] },

  // ── INTEROCEÁNICA SUR (Cusco → Puerto Maldonado) ───────────────────────
  { id: '78', name: 'DANIEL', owner: 'Transportes Amazónicos SAC', plate: 'IOS-101', engineCode: 'ISX-IO-078', type: 'truck', status: 'active' as const, position: [-13.1500, -71.6000] as [number, number], speed: '42 km/h', address: 'Carretera Interoceánica Sur Km 45, Paucartambo, Cusco', coords: '-13.150000, -71.600000', direction: 'Este', odometer: '56,300 KM', fuel: '62%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:06:11 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200078', linea: '+51 984 078 001', groups: [{ name: 'Transportes Amazónicos', subgroup: 'Interoceánica' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '42 km/h', fuel: '62%', alarmCount: 0, lastSeen: '05/05/2026 09:06:11 a.m.' }] as GpsDevice[] },
  { id: '79', name: 'OLGA', owner: 'Logística Madre de Dios EIRL', plate: 'IOS-202', engineCode: 'D4D-IO-079', type: 'truck', status: 'active' as const, position: [-12.9500, -71.4500] as [number, number], speed: '38 km/h', address: 'Carretera Interoceánica Sur Km 120, Pillcopata, Cusco', coords: '-12.950000, -71.450000', direction: 'Este', odometer: '45,200 KM', fuel: '48%', gpsCount: 1, alarmCount: 2, lastSeen: '05/05/2026 08:52:33 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200079', linea: '+51 984 078 002', groups: [{ name: 'Logística Madre de Dios', subgroup: 'Interoceánica' }], reportStatus: 'low-signal' as const, ignition: 'on' as const, speed: '38 km/h', fuel: '48%', alarmCount: 2, lastSeen: '05/05/2026 08:52:33 a.m.' }] as GpsDevice[] },

  // ── CARRETERA FERNANDO BELAÚNDE (Marginal de la Selva) ─────────────────
  { id: '80', name: 'ISRAEL', owner: 'Transportes Selva Norte SA', plate: 'FBT-101', engineCode: 'ISB-FB-080', type: 'truck', status: 'active' as const, position: [-8.1800, -76.5200] as [number, number], speed: '48 km/h', address: 'Carretera Fernando Belaúnde Terry Km 580, Tocache, San Martín', coords: '-8.180000, -76.520000', direction: 'Norte', odometer: '121,500 KM', fuel: '60%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:03:55 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200080', linea: '+51 942 080 001', groups: [{ name: 'Transportes Selva Norte', subgroup: 'Marginal' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '48 km/h', fuel: '60%', alarmCount: 0, lastSeen: '05/05/2026 09:03:55 a.m.' }] as GpsDevice[] },
  { id: '81', name: 'GRACIELA', owner: 'Distribuidora San Martín EIRL', plate: 'FBT-202', engineCode: '2NZ-FB-081', type: 'car', status: 'active' as const, position: [-6.4900, -76.3600] as [number, number], speed: '52 km/h', address: 'Carretera Fernando Belaúnde Terry Km 690, Tarapoto, San Martín', coords: '-6.490000, -76.360000', direction: 'Norte', odometer: '9,800 KM', fuel: '85%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:11:50 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200081', linea: '+51 942 080 002', groups: [{ name: 'Distribuidora San Martín', subgroup: 'Marginal' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '52 km/h', fuel: '85%', alarmCount: 0, lastSeen: '05/05/2026 09:11:50 a.m.' }] as GpsDevice[] },

  // ── CARRETERA TINGO MARÍA (Huánuco) ─────────────────────────────────
  { id: '82', name: 'ALFREDO', owner: 'Transportes Huallaga Central SAC', plate: 'TMA-101', engineCode: 'ISX-TM-082', type: 'truck', status: 'active' as const, position: [-9.3000, -76.0000] as [number, number], speed: '40 km/h', address: 'Carretera Tingo María Km 100, Huánuco', coords: '-9.300000, -76.000000', direction: 'Norte', odometer: '74,600 KM', fuel: '57%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:05:05 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200082', linea: '+51 962 080 001', groups: [{ name: 'Transportes Huallaga Central', subgroup: 'Flota Selva' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '40 km/h', fuel: '57%', alarmCount: 0, lastSeen: '05/05/2026 09:05:05 a.m.' }] as GpsDevice[] },

  // ── CARRETERA PUNO → DESAGUADERO (frontera Bolivia) ─────────────────
  { id: '83', name: 'RAUL', owner: 'Transportes Frontera Sur SA', plate: 'PND-101', engineCode: 'D4D-PD-083', type: 'truck', status: 'active' as const, position: [-15.9200, -70.1000] as [number, number], speed: '68 km/h', address: 'Carretera Puno-Desaguadero Km 30, Puno', coords: '-15.920000, -70.100000', direction: 'Sur', odometer: '178,300 KM', fuel: '65%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:07:22 a.m.', gpsDevices: [{ type: 'flotas' as GpsServiceType, imei: '354823091200083', linea: '+51 951 080 001', groups: [{ name: 'Transportes Frontera Sur', subgroup: 'Internacional' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '68 km/h', fuel: '65%', alarmCount: 0, lastSeen: '05/05/2026 09:07:22 a.m.' }] as GpsDevice[] },

  // ── CARRETERA AREQUIPA → MOQUEGUA ────────────────────────────────────
  { id: '84', name: 'TANIA', owner: 'Transportes Moquegua SAC', plate: 'AMO-101', engineCode: 'ISB-AM-084', type: 'car', status: 'active' as const, position: [-16.7900, -71.1300] as [number, number], speed: '78 km/h', address: 'Carretera Arequipa-Moquegua Km 70, Moquegua', coords: '-16.790000, -71.130000', direction: 'Sur', odometer: '33,400 KM', fuel: '74%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:09:30 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200084', linea: '+51 953 080 001', groups: [{ name: 'Transportes Moquegua', subgroup: 'Costa Sur' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '78 km/h', fuel: '74%', alarmCount: 0, lastSeen: '05/05/2026 09:09:30 a.m.' }] as GpsDevice[] },

  // ── PANAMERICANA ICA → NAZCA (desierto costero) ─────────────────────
  { id: '85', name: 'ZULEMA', owner: 'Transportes Nazca EIRL', plate: 'INZ-101', engineCode: 'K24A-IN-085', type: 'car', status: 'active' as const, position: [-14.8300, -75.2200] as [number, number], speed: '85 km/h', address: 'Panamericana Sur Km 420, Desierto de Ica, Nazca', coords: '-14.830000, -75.220000', direction: 'Sur', odometer: '27,100 KM', fuel: '66%', gpsCount: 1, alarmCount: 0, lastSeen: '05/05/2026 09:10:50 a.m.', gpsDevices: [{ type: 'basico' as GpsServiceType, imei: '354823091200085', linea: '+51 956 080 001', groups: [{ name: 'Transportes Nazca', subgroup: 'Costa Sur' }], reportStatus: 'reporting' as const, ignition: 'on' as const, speed: '85 km/h', fuel: '66%', alarmCount: 0, lastSeen: '05/05/2026 09:10:50 a.m.' }] as GpsDevice[] },
];

export const RUTAS_DATA = [
  { id: 'r1', name: 'Ruta Lima Norte',   status: 'active',   group: 'Reparto', company: 'Logística Express SAC',       date: '05/05/2026', stops: 8,  distance: '42 km' },
  { id: 'r2', name: 'Ruta Lima Sur',     status: 'active',   group: 'Reparto', company: 'Repartos San Borja EIRL',     date: '05/05/2026', stops: 5,  distance: '28 km' },
  { id: 'r3', name: 'Ruta Callao',       status: 'inactive', group: 'Pesados', company: 'Transportes Callao SAC',      date: '04/05/2026', stops: 3,  distance: '19 km' },
  { id: 'r4', name: 'Ruta Miraflores',   status: 'active',   group: 'Delivery', company: 'Delivery Miraflores SAC',   date: '05/05/2026', stops: 12, distance: '15 km' },
  { id: 'r5', name: 'Ruta Comas',        status: 'active',   group: 'Bus',     company: 'Grupo Transporte Comas SA',   date: '05/05/2026', stops: 20, distance: '35 km' },
  { id: 'r6', name: 'Ruta Minera',       status: 'inactive', group: 'Pesados', company: 'Minera Perú Holdings SA',     date: '03/05/2026', stops: 2,  distance: '95 km' },
  { id: 'r7', name: 'Ruta Panamericana', status: 'active',   group: 'Reparto', company: 'Distribuidora Lima Norte SRL', date: '05/05/2026', stops: 7, distance: '61 km' },
  { id: 'r8', name: 'Ruta Centro',       status: 'inactive', group: 'Reparto', company: 'Logística Express SAC',       date: '02/05/2026', stops: 9,  distance: '22 km' },
];
