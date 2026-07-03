export type CameraPosition = 'frontal' | 'trasera' | 'lateral-der' | 'lateral-izq' | 'cabina' | 'exterior';

export interface Camera {
  id: string;
  vehicleId: string;
  position: CameraPosition;
  label: string;
  isOnline: boolean;
  source?: 'webcam'; // undefined = simulated CSS scene
}

export const CAMERA_POSITION_LABELS: Record<CameraPosition, string> = {
  frontal:      'Frontal',
  trasera:      'Trasera',
  'lateral-der': 'Lat. Der.',
  'lateral-izq': 'Lat. Izq.',
  cabina:       'Cabina',
  exterior:     'Exterior',
};

export const VEHICLE_CAMERAS: Record<string, Camera[]> = {
  '1': [
    { id: 'cam-1-1', vehicleId: '1', position: 'frontal', label: 'Frontal', isOnline: true },
    { id: 'cam-1-2', vehicleId: '1', position: 'cabina',  label: 'Cabina',  isOnline: true, source: 'webcam' },
  ],
  '3': [
    { id: 'cam-3-1', vehicleId: '3', position: 'frontal',      label: 'Frontal',     isOnline: true },
    { id: 'cam-3-2', vehicleId: '3', position: 'trasera',      label: 'Trasera',     isOnline: true },
    { id: 'cam-3-3', vehicleId: '3', position: 'lateral-der',  label: 'Lat. Der.',   isOnline: true },
    { id: 'cam-3-4', vehicleId: '3', position: 'cabina',       label: 'Cabina',      isOnline: false },
  ],
  '7': [
    { id: 'cam-7-1', vehicleId: '7', position: 'frontal', label: 'Frontal', isOnline: true },
  ],
  '2': [
    { id: 'cam-2-1', vehicleId: '2', position: 'frontal',     label: 'Frontal',   isOnline: true },
    { id: 'cam-2-2', vehicleId: '2', position: 'trasera',     label: 'Trasera',   isOnline: true },
    { id: 'cam-2-3', vehicleId: '2', position: 'lateral-izq', label: 'Lat. Izq.', isOnline: false },
  ],
  // XYZ-100 (CARLOS) — 5 cámaras
  '5': [
    { id: 'cam-5-1', vehicleId: '5', position: 'frontal',      label: 'Frontal',    isOnline: true  },
    { id: 'cam-5-2', vehicleId: '5', position: 'trasera',      label: 'Trasera',    isOnline: true  },
    { id: 'cam-5-3', vehicleId: '5', position: 'lateral-der',  label: 'Lat. Der.',  isOnline: true  },
    { id: 'cam-5-4', vehicleId: '5', position: 'lateral-izq',  label: 'Lat. Izq.',  isOnline: true  },
    { id: 'cam-5-5', vehicleId: '5', position: 'cabina',       label: 'Cabina',     isOnline: true  },
  ],
};

export function getCamerasForVehicle(vehicleId: string): Camera[] {
  return VEHICLE_CAMERAS[vehicleId] ?? [];
}
