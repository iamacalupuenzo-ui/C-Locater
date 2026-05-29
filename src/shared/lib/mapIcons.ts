import L from 'leaflet';
import type { Vehicle } from './data';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':  return '#34C759';
    case 'stopped': return '#FF3B30';
    case 'offline': return '#8E8E93';
    default:        return '#34C759';
  }
};

export const getIconSvg = (type: string, size = 14) => {
  if (type === 'motorcycle') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M5 17h3l2-5h5l2 3h2"/><path d="M13 12l-2-4h-2"/></svg>`;
  }
  if (type === 'truck') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
  }
  if (type === 'bus') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6M16 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>`;
  }
  if (type === 'machinery') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20M3 17V9l4-4h6l4 4v8"/><path d="M9 17V9m6 8V9"/><rect x="7" y="5" width="10" height="4" rx="1"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-3h6l3 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/></svg>`;
};

// Pill has border:2px on all sides → outer height = 2+4+26+4+2 = 38px
const COLLAPSED_ANCHOR_Y = 58; // pill_outer(38) + gap(2) + stem(12) + dot(6)

export const createCustomIcon = (vehicle: Vehicle, isHighlighted = false, isDark = false) => {
  const dotColor   = getStatusColor(vehicle.status);
  const pillBg     = isDark ? 'rgba(24,24,27,0.96)'   : 'rgba(255,255,255,0.96)';
  const pillBorder = isHighlighted
    ? '2px solid #0052CC'
    : isDark ? '2px solid rgba(63,63,70,0.8)' : '2px solid white';
  const pillShadow = isHighlighted
    ? '0 0 0 3px rgba(0,82,204,0.2), 0 4px 16px rgba(0,0,0,0.18)'
    : isDark ? '0 4px 16px rgba(0,0,0,0.40)' : '0 4px 16px rgba(0,0,0,0.08)';
  const iconBg     = isDark ? '#27272a' : '#f9fafb';
  const iconBorder = isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb';
  const iconColor  = isDark ? '#d4d4d8' : '#374151';
  const nameColor  = isDark ? '#f4f4f5' : '#111827';
  const plateColor = isDark ? '#71717a'  : '#6b7280';
  const stemColor  = isDark ? '#ffffff'  : '#9ca3af';
  const dotBorder  = isDark ? '2px solid #18181b' : '2px solid white';
  const alarmBg    = isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2';
  const alarmBorder = isDark ? 'rgba(239,68,68,0.4)' : '#FECACA';
  const maxChars = Math.max(vehicle.name.length * 7.5, vehicle.plate.length * 6.5);
  const pillW    = Math.max(Math.ceil(26 + 7 + maxChars + 24), 90);
  const hasAlarms = vehicle.alarmCount && vehicle.alarmCount > 0;

  const html = `
    <div style="display:inline-flex;flex-direction:column;align-items:center;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
      <div style="position:relative;background:${pillBg};backdrop-filter:blur(16px);border-radius:999px;box-shadow:${pillShadow};border:${pillBorder};padding:4px 12px 4px 4px;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;">
        ${hasAlarms ? `
        <div style="position:absolute;top:-6px;right:-6px;z-index:15;display:flex;align-items:center;justify-content:center;width:18px;height:18px;background:${alarmBg};border:1.5px solid ${alarmBorder};border-radius:50%;box-shadow:0 2px 6px rgba(239,68,68,0.25);">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>` : ''}
        <div style="width:26px;height:26px;border-radius:50%;background:${iconBg};display:flex;align-items:center;justify-content:center;color:${iconColor};border:${iconBorder};flex-shrink:0;position:relative;">
          ${getIconSvg(vehicle.type)}
          <div style="position:absolute;top:-1px;right:-1px;width:9px;height:9px;border-radius:50%;background:${dotColor};border:${dotBorder};"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:11.5px;font-weight:700;color:${nameColor};line-height:1;">${vehicle.name}</span>
          <span style="font-size:9.5px;font-weight:600;color:${plateColor};line-height:1;">${vehicle.plate}</span>
        </div>
      </div>
      <div style="width:1px;height:12px;background:${stemColor};margin-top:2px;"></div>
      <div style="width:6px;height:6px;background:${stemColor};border-radius:50%;"></div>
    </div>`;

  return L.divIcon({
    html,
    className: 'custom-fleet-marker',
    iconSize:   [pillW, COLLAPSED_ANCHOR_Y + 6],
    iconAnchor: [pillW / 2, COLLAPSED_ANCHOR_Y],
  });
};

// Genera trail de recorrido simulado a partir de la posición actual del vehículo
export function generateMockTrail(position: [number, number], seed: number): [number, number][] {
  const steps = 18;
  const trail: [number, number][] = [];
  let [lat, lng] = position;

  // Retrocede el recorrido desde la posición actual
  const rng = (n: number) => ((Math.sin(seed * n * 9301 + 49297) * 233280) % 1 + 1) % 1;

  for (let i = steps; i >= 0; i--) {
    const dLat = (rng(i * 2)     - 0.5) * 0.0008;
    const dLng = (rng(i * 2 + 1) - 0.5) * 0.0012;
    trail.push([lat + dLat * i, lng + dLng * i]);
  }

  trail.push(position); // posición actual al final
  return trail;
}
