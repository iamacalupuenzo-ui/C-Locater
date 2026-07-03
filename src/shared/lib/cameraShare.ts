export function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function buildShareUrl(roomId: string, vehiclePlate: string, cameraLabel: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('cam-share', roomId);
  url.searchParams.set('vehicle', vehiclePlate);
  url.searchParams.set('label', cameraLabel);
  return url.toString();
}

export interface ShareParams {
  roomId: string;
  vehicle: string;
  label: string;
}

export function getShareParams(): ShareParams | null {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('cam-share');
  if (!roomId) return null;
  return {
    roomId,
    vehicle: params.get('vehicle') ?? 'Unidad',
    label:   params.get('label')   ?? 'Cámara',
  };
}

export function clearShareParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('cam-share');
  url.searchParams.delete('vehicle');
  url.searchParams.delete('label');
  window.history.replaceState({}, '', url.toString());
}

export const CHANNEL_PREFIX = 'cam-share-';
